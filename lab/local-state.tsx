import { useEffect, useState } from "react";
import { Alert, Icon, Button } from "../src/ui";
export function useLocalState<T>(
  key: string,
  seed: () => T,
  read: (raw: string) => T,
) {
  const [value, setValue] = useState<T>(() => {
    try {
      const raw = localStorage.getItem(key);
      return raw ? read(raw) : seed();
    } catch {
      return seed();
    }
  });
  const [failed, setFailed] = useState(false);
  useEffect(() => {
    try {
      localStorage.setItem(key, JSON.stringify(value));
      setFailed(false);
    } catch {
      setFailed(true);
    }
  }, [key, value]);
  return { value, setValue, failed };
}
export function StorageNotice({ failed }: { failed: boolean }) {
  return failed ? (
    <Alert tone="danger">
      <Alert.Icon>
        <Icon name="close" size={16} />
      </Alert.Icon>
      <Alert.Title>更改暂未保存</Alert.Title>
      <Alert.Body>
        浏览器存储不可用。当前更改仍在页面中，刷新可能丢失。
      </Alert.Body>
    </Alert>
  ) : null;
}
export function AppearanceButton() {
  const [dark, setDark] = useState(() => {
    try {
      return localStorage.getItem("uagray-internal-appearance") === "dark";
    } catch {
      return false;
    }
  });
  useEffect(() => {
    document.documentElement.dataset.theme = dark ? "dark" : "light";
    try {
      localStorage.setItem(
        "uagray-internal-appearance",
        dark ? "dark" : "light",
      );
    } catch {
      /* Keep the active appearance for this session. */
    }
  }, [dark]);
  return (
    <Button
      emphasis="quiet"
      aria-label={dark ? "切换浅色外观" : "切换深色外观"}
      onClick={() => setDark((value) => !value)}
      shape="square"
    >
      <Button.Icon>
        <Icon name={dark ? "sun" : "moon"} />
      </Button.Icon>
    </Button>
  );
}
