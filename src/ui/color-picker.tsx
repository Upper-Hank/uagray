import {
  useEffect,
  useLayoutEffect,
  useRef,
  useState,
  type ComponentPropsWithRef,
} from "react";
import { ColorArea, ColorThumb } from "react-aria-components/ColorArea";
import { ColorSlider } from "react-aria-components/ColorSlider";
import { SliderTrack } from "react-aria-components/Slider";
import {
  ColorPicker as AriaColorPicker,
  parseColor,
  type Color,
} from "react-aria-components/ColorPicker";
import { Surface, Button } from "./components";
import { Icon } from "./icons";
import { Field, Input, NumberInput, Select } from "./fields";

export function normalizeHex(value: string): string | null {
  let hex = value.trim().replace(/^#/, "");
  if (/^[\da-f]{3,4}$/i.test(hex))
    hex = [...hex].map((digit) => digit + digit).join("");
  return /^(?:[\da-f]{6}|[\da-f]{8})$/i.test(hex)
    ? `#${hex.toUpperCase()}`
    : null;
}
type Format = "hex" | "rgb" | "hsb" | "hsl";
type EyeDropperConstructor = new () => {
  open: (options: { signal: AbortSignal }) => Promise<{ sRGBHex: string }>;
};
export type ColorPickerProps = {
  value?: string;
  defaultValue?: string;
  onValueChange?: (value: string) => void;
  disabled?: boolean;
} & Omit<
  ComponentPropsWithRef<"div">,
  "defaultValue" | "children" | "onChange" | "aria-label"
> &
  (
    | {
        "aria-label": string;
        /** @deprecated Use `aria-label`. */
        label?: string;
      }
    | {
        "aria-label"?: undefined;
        /** @deprecated Use `aria-label`. */
        label: string;
      }
  );
function serialize(color: Color) {
  return color
    .toString(color.getChannelValue("alpha") === 1 ? "hex" : "hexa")
    .toUpperCase();
}

/** A shared HSB color model preserves hue even when saturation or brightness is zero. */
export function ColorPicker({
  "aria-label": ariaLabel,
  label,
  value,
  defaultValue = "#525252",
  onValueChange,
  disabled = false,
  className,
  style,
  ...props
}: ColorPickerProps) {
  const name = ariaLabel ?? label;
  const [color, setColor] = useState(() =>
    parseColor(normalizeHex(value ?? defaultValue) ?? "#525252").toFormat(
      "hsb",
    ),
  );
  const [format, setFormat] = useState<Format>("hex");
  const current = serialize(color);
  const [draft, setDraft] = useState(current);
  const [invalid, setInvalid] = useState(false);
  const [picking, setPicking] = useState(false);
  const [pickError, setPickError] = useState("");
  const abort = useRef<AbortController | null>(null);
  const Dropper = (
    globalThis as typeof globalThis & { EyeDropper?: EyeDropperConstructor }
  ).EyeDropper;
  useEffect(() => () => abort.current?.abort(), []);
  useEffect(() => {
    if (disabled) {
      abort.current?.abort();
      setPicking(false);
    }
  }, [disabled]);
  useLayoutEffect(() => {
    if (value === undefined) return;
    const next = normalizeHex(value);
    if (!next) return;
    const parsed = parseColor(next).toFormat("hsb");
    if (serialize(parsed) === current) return;
    setColor(parsed);
  }, [value, current]);
  useLayoutEffect(() => {
    setDraft(current);
    setInvalid(false);
  }, [current]);
  function commit(next: Color) {
    if (disabled) return;
    const serialized = serialize(next);
    setColor(next.toFormat("hsb"));
    setDraft(serialized);
    setInvalid(false);
    onValueChange?.(serialized);
  }
  function commitDraft() {
    const hex = normalizeHex(draft);
    if (hex) {
      const next = parseColor(hex);
      if (serialize(next) !== current) commit(next);
      else {
        setDraft(current);
        setInvalid(false);
      }
    } else setInvalid(true);
  }
  async function sample() {
    if (!Dropper || disabled || picking) return;
    const controller = new AbortController();
    abort.current = controller;
    setPicking(true);
    setPickError("");
    try {
      const result = await new Dropper().open({ signal: controller.signal });
      if (!controller.signal.aborted)
        commit(
          parseColor(result.sRGBHex).withChannelValue(
            "alpha",
            color.getChannelValue("alpha"),
          ),
        );
    } catch (error) {
      if (
        !controller.signal.aborted &&
        !(error instanceof DOMException && error.name === "AbortError")
      )
        setPickError("取色失败，请重试。");
    } finally {
      if (!controller.signal.aborted) setPicking(false);
    }
  }
  const channelColor = format === "hex" ? color : color.toFormat(format);
  const channels = format === "hex" ? [] : channelColor.getColorChannels();
  return (
    <Surface
      {...props}
      variant="raised"
      className={`ui-color-picker ${className ?? ""}`}
      style={style}
    >
      <AriaColorPicker value={color} onChange={commit}>
        <fieldset disabled={disabled} className="ui-color-picker-fields">
          <legend className="ui-sr-only">{name}</legend>
          <ColorArea
            aria-label={`${name}饱和度与明度`}
            colorSpace="hsb"
            xChannel="saturation"
            yChannel="brightness"
            isDisabled={disabled}
            className="ui-color-area"
          >
            <ColorThumb className="ui-color-thumb" />
          </ColorArea>
          <div className="ui-color-picker-sliders">
            <Button
              aria-label={Dropper ? "吸管取色" : "当前浏览器不支持吸管取色"}
              emphasis="quiet"
              disabled={disabled || !Dropper || picking}
              onClick={sample}
              shape="square"
            >
              <Button.Icon>
                <Icon name={"eyedropper"} />
              </Button.Icon>
            </Button>
            <div className="ui-color-picker-tracks">
              <ColorSlider
                aria-label="色相"
                channel="hue"
                colorSpace="hsb"
                isDisabled={disabled}
                className="ui-color-slider"
              >
                <SliderTrack className="ui-color-track">
                  <ColorThumb className="ui-color-thumb" />
                </SliderTrack>
              </ColorSlider>
              <ColorSlider
                aria-label="透明度"
                channel="alpha"
                isDisabled={disabled}
                className="ui-color-slider ui-color-slider--alpha"
              >
                <SliderTrack className="ui-color-track">
                  <ColorThumb className="ui-color-thumb" />
                </SliderTrack>
              </ColorSlider>
            </div>
          </div>
          <div className="ui-color-picker-values">
            <Select
              aria-label="颜色格式"
              value={format}
              onValueChange={(next) => setFormat(next as Format)}
              disabled={disabled}
            >
              {["hex", "rgb", "hsb", "hsl"].map((value) => (
                <Select.Item key={value} value={value}>
                  {value.toUpperCase()}
                </Select.Item>
              ))}
            </Select>
            {format === "hex" ? (
              <Field>
                <Field.Label>{`${name} HEX`}</Field.Label>
                <Field.Control>
                  <Input
                    value={draft}
                    maxLength={9}
                    spellCheck={false}
                    autoComplete="off"
                    onChange={(event) => {
                      setDraft(event.target.value);
                      setInvalid(false);
                    }}
                    onBlur={commitDraft}
                    onKeyDown={(event) => {
                      if (event.key === "Enter") {
                        event.preventDefault();
                        commitDraft();
                      }
                      if (event.key === "Escape") {
                        setDraft(current);
                        setInvalid(false);
                      }
                    }}
                  />
                </Field.Control>
                {invalid && (
                  <Field.Error>请输入 3、4、6 或 8 位 HEX 颜色。</Field.Error>
                )}
              </Field>
            ) : (
              <div className="ui-color-picker-channels">
                {channels.map((channel) => {
                  const range = channelColor.getChannelRange(channel);
                  return (
                    <div key={channel} className="ui-color-channel">
                      <span aria-hidden="true">
                        {
                          {
                            red: "R",
                            green: "G",
                            blue: "B",
                            hue: "H",
                            saturation: "S",
                            brightness: "B",
                            lightness: "L",
                            alpha: "A",
                          }[channel]
                        }
                      </span>
                      <Field>
                        <Field.Label>
                          {channelColor.getChannelName(channel, "zh-CN")}
                        </Field.Label>
                        <Field.Control>
                          <NumberInput
                            value={Math.round(
                              channelColor.getChannelValue(channel),
                            )}
                            min={range.minValue}
                            max={range.maxValue}
                            step={range.step}
                            onValueChange={(next) =>
                              commit(
                                channelColor.withChannelValue(channel, next),
                              )
                            }
                          />
                        </Field.Control>
                      </Field>
                    </div>
                  );
                })}
              </div>
            )}
            <div className="ui-color-channel ui-color-alpha">
              <span aria-hidden="true">%</span>
              <Field>
                <Field.Label>透明度 %</Field.Label>
                <Field.Control>
                  <NumberInput
                    value={Math.round(color.getChannelValue("alpha") * 100)}
                    min={0}
                    max={100}
                    onValueChange={(next) =>
                      commit(color.withChannelValue("alpha", next / 100))
                    }
                  />
                </Field.Control>
              </Field>
            </div>
          </div>
          {pickError && <span role="alert">{pickError}</span>}
        </fieldset>
      </AriaColorPicker>
    </Surface>
  );
}
