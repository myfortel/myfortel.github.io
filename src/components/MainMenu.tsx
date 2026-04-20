import { useMemo } from "react";
import { Button } from "antd";
import { useLocation, useNavigate } from "react-router-dom";

export const MainMenu = ({ defaultValue }: { defaultValue: string }) => {
  const location = useLocation();
  const navigate = useNavigate();

  const sharedQuery = useMemo(() => {
    const urlSearchParams = new URLSearchParams();
    const sourceParams = new URLSearchParams(location.search);
    const cal = sourceParams.get("cal");
    if (cal) {
      urlSearchParams.set("cal", cal);
    }
    const y = sourceParams.get("y");
    if (y) {
      urlSearchParams.set("y", y);
    }
    const m = sourceParams.get("m");
    if (m) {
      urlSearchParams.set("m", m);
    }
    const d = sourceParams.get("d");
    if (d) {
      urlSearchParams.set("d", d);
    }
    const lp = sourceParams.get("lp");
    if (lp === "0" || lp === "1") {
      urlSearchParams.set("lp", lp);
    }
    const g = sourceParams.get("g");
    if (g) {
      urlSearchParams.set("g", g);
    }
    return urlSearchParams.toString();
  }, [location.search]);

  const selectedKey = useMemo(() => {
    if (location.pathname.includes("dayBoards")) {
      return "dayBoards";
    }
    if (location.pathname.includes("buildBoard")) {
      return "buildBoard";
    }
    return defaultValue;
  }, [defaultValue, location.pathname]);

  const go = (key: "buildBoard" | "dayBoards") => {
    navigate({
      pathname: `/${key}`,
      search: sharedQuery ? `?${sharedQuery}` : "",
    });
  };

  return (
    <div style={{ marginBottom: 12 }}>
      <Button
        type={selectedKey === "buildBoard" ? "primary" : "default"}
        onClick={() => go("buildBoard")}
        style={{ marginRight: 8 }}
      >
        起盤
      </Button>
      <Button
        type={selectedKey === "dayBoards" ? "primary" : "default"}
        onClick={() => go("dayBoards")}
      >
        全日命盤
      </Button>
    </div>
  );
};
