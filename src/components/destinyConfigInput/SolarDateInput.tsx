import { useCallback } from "react";
import { arrayRange } from "../../util/numberUtils";

const yearOptions = arrayRange(1900, 2050).map((num) => {
  return { label: "" + num, value: num };
});

const monthOptions = arrayRange(1, 12).map((num) => {
  return { label: "" + num, value: num };
});

const dayOptions = arrayRange(1, 31).map((num) => {
  return { label: "" + num, value: num };
});

const selectStyle = {
  height: 32,
  borderRadius: 6,
  border: "1px solid #d9d9d9",
  padding: "0 8px",
};

export const SolarDateInput = ({
  year,
  month,
  day,
  onChangeYear,
  onChangeMonth,
  onChangeDay,
}: {
  year: number | null;
  month: number | null;
  day: number | null;
  onChangeYear: (value: number) => void;
  onChangeMonth: (value: number) => void;
  onChangeDay: (value: number) => void;
}) => {
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
      </div>
    </div>
  );
};
