import { Checkbox } from "antd";
import { CheckboxChangeEvent } from "antd/es/checkbox";
import { useCallback } from "react";
import {
  arrayRange,
  CHINESE_DAYS_OF_MONTH,
  CHINESE_ONE_TO_TWELVE,
} from "../../util/numberUtils";

const yearOptions = arrayRange(1900, 2100).map((num) => {
  return { label: "" + num, value: num };
});

const monthOptions = arrayRange(1, 12).map((num) => {
  return { label: CHINESE_ONE_TO_TWELVE[num - 1], value: num };
});

const dayOptions = arrayRange(1, 30).map((num) => {
  return { label: CHINESE_DAYS_OF_MONTH[num - 1], value: num };
});

const selectStyle = {
  height: 32,
  borderRadius: 6,
  border: "1px solid #d9d9d9",
  padding: "0 8px",
};

export const LunarDateInput = ({
  year,
  month,
  day,
  leap,
  onChangeYear,
  onChangeMonth,
  onChangeDay,
  onChangeLeap,
}: {
  year: number | null;
  month: number | null;
  day: number | null;
  leap: boolean;
  onChangeYear: (value: number) => void;
  onChangeMonth: (value: number) => void;
  onChangeDay: (value: number) => void;
  onChangeLeap: (value: boolean) => void;
}) => {
  const _onChangeLeap = useCallback(
    (e: CheckboxChangeEvent) => {
      onChangeLeap(e.target.checked);
    },
    [onChangeLeap]
  );

  return (
    <div>
      <div>
        {" 年: "}
        <select
          value={year ?? ""}
          onChange={(e) => onChangeYear(Number(e.target.value))}
          style={{ ...selectStyle, width: 80 }}
        >
          {yearOptions.map((option) => (
            <option key={option.value} value={option.value}>
              {option.label}
            </option>
          ))}
        </select>

        {" 月: "}
        <select
          value={month ?? ""}
          onChange={(e) => onChangeMonth(Number(e.target.value))}
          style={{ ...selectStyle, width: 80 }}
        >
          {monthOptions.map((option) => (
            <option key={option.value} value={option.value}>
              {option.label}
            </option>
          ))}
        </select>

        {" 日: "}
        <select
          value={day ?? ""}
          onChange={(e) => onChangeDay(Number(e.target.value))}
          style={{ ...selectStyle, width: 100 }}
        >
          {dayOptions.map((option) => (
            <option key={option.value} value={option.value}>
              {option.label}
            </option>
          ))}
        </select>
        <div
          className="inline-block"
          style={{ paddingLeft: 10, paddingRight: 10 }}
        ></div>
        <Checkbox checked={leap} onChange={_onChangeLeap}>
          閏月
        </Checkbox>
      </div>
    </div>
  );
};
