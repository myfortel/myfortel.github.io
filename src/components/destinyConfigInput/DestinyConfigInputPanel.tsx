import { useCallback, useState } from "react";
import { Button, Card } from "antd";
import { LunarDateInput } from "./LunarDateInput";
import { SolarDateInput } from "./SolarDateInput";
import { CalendarType, defaultCalendar, Gender } from "fortel-ziweidoushu";
import { DateTime } from "luxon";
import { LineSeparator } from "./LineSeparator";
import { ConfigDataStateType } from "../../view/buildBoard/stateMapper";

const bornTimeOptions = [
  { label: "早子 (00:00am-00:59am)", value: 0 },
  { label: "丑 (01:00am-02:59am)", value: 1 },
  { label: "寅 (03:00am-04:59am)", value: 2 },
  { label: "卯 (05:00am-06:59am)", value: 3 },
  { label: "辰 (07:00am-08:59am)", value: 4 },
  { label: "巳 (09:00am-10:59am)", value: 5 },
  { label: "午 (11:00am-12:59pm)", value: 6 },
  { label: "未 (13:00pm-14:59pm)", value: 7 },
  { label: "申 (15:00pm-16:59pm)", value: 8 },
  { label: "酉 (17:00pm-18:59pm)", value: 9 },
  { label: "戌 (19:00pm-20:59pm)", value: 10 },
  { label: "亥 (21:00pm-22:59pm)", value: 11 },
  { label: "夜子 (23:00pm-23:59pm)", value: 12 },
];

const configTypeOptions = [
  { label: "地盤", value: 0 },
  { label: "天盤", value: 1 },
  { label: "人盤", value: 2 },
];

const genderOptions = [
  { label: "男", value: "M" },
  { label: "女", value: "F" },
];

const selectStyle: React.CSSProperties = {
  height: 32,
  borderRadius: 6,
  border: "1px solid #d9d9d9",
  padding: "0 8px",
};

export const DestinyConfigInputPanel = (
  props: ConfigDataStateType & {
    updateConfig: (dataState: ConfigDataStateType) => void;
  }
) => {
  const clamp = (value: number, min: number, max: number): number =>
    Math.min(max, Math.max(min, value));

  const getSolarMonthMaxDay = (year: number, month: number): number => {
    return DateTime.local(year, month, 1).daysInMonth ?? 31;
  };

  const getLunarMonthMaxDay = (
    year: number,
    month: number,
    leap: boolean
  ): { maxDay: number; leap: boolean } => {
    try {
      return {
        maxDay: defaultCalendar.lunarMonthDays(year, month, leap),
        leap,
      };
    } catch (e) {
      if (leap) {
        try {
          return {
            maxDay: defaultCalendar.lunarMonthDays(year, month, false),
            leap: false,
          };
        } catch (fallbackError) {
          console.debug("lunar month days error", e, fallbackError);
        }
      } else {
        console.debug("lunar month days error", e);
      }
    }
    return { maxDay: 30, leap: false };
  };

  const normalizeDataState = (state: ConfigDataStateType): ConfigDataStateType => {
    if (state.calendarType === CalendarType.LUNAR) {
      const lunarYear = state.lunarYear ?? 1990;
      const lunarMonth = clamp(state.lunarMonth ?? 1, 1, 12);
      const monthInfo = getLunarMonthMaxDay(lunarYear, lunarMonth, state.leap);
      const lunarDay = clamp(state.lunarDay ?? 1, 1, monthInfo.maxDay);
      return {
        ...state,
        lunarYear,
        lunarMonth,
        lunarDay,
        leap: monthInfo.leap,
      };
    }
    const solarYear = state.solarYear ?? 1990;
    const solarMonth = clamp(state.solarMonth ?? 1, 1, 12);
    const solarDay = clamp(
      state.solarDay ?? 1,
      1,
      getSolarMonthMaxDay(solarYear, solarMonth)
    );
    return {
      ...state,
      solarYear,
      solarMonth,
      solarDay,
    };
  };

  const [dataState, setDataState] = useState<ConfigDataStateType>({
    calendarType: props.calendarType ?? CalendarType.LUNAR,
    lunarYear: props.lunarYear ?? 1990,
    lunarMonth: props.lunarMonth ?? 1,
    lunarDay: props.lunarDay ?? 1,
    leap: props.leap ?? false,
    solarYear: props.solarYear ?? 1990,
    solarMonth: props.solarMonth ?? 1,
    solarDay: props.solarDay ?? 1,
    bornTime: props.bornTime ?? null,
    configType: props.configType ?? 1,
    gender: props.gender ?? null,
  });

  const onChangeCalendarType = useCallback(
    (value: string | number) => {
      setDataState((prev) => {
        const normalizedPrev = normalizeDataState(prev);
        if (
          normalizedPrev.calendarType === CalendarType.LUNAR &&
          value === CalendarType.SOLAR &&
          normalizedPrev.lunarYear &&
          normalizedPrev.lunarMonth &&
          normalizedPrev.lunarDay
        ) {
          try {
            const solarDate = defaultCalendar.lunar2solar(
              normalizedPrev.lunarYear,
              normalizedPrev.lunarMonth,
              normalizedPrev.lunarDay,
              normalizedPrev.leap
            );
            if (solarDate) {
              return {
                ...normalizedPrev,
                calendarType: CalendarType.SOLAR,
                solarYear: solarDate.solarYear,
                solarMonth: solarDate.solarMonth,
                solarDay: solarDate.solarDay,
              };
            }
          } catch (e) {
            console.debug("convert date error", e);
          }
          return {
            ...normalizedPrev,
            calendarType: CalendarType.SOLAR,
          };
        }

        if (
          normalizedPrev.calendarType === CalendarType.SOLAR &&
          value === CalendarType.LUNAR &&
          normalizedPrev.solarYear &&
          normalizedPrev.solarMonth &&
          normalizedPrev.solarDay
        ) {
          try {
            const lunarDate = defaultCalendar.solar2lunar(
              normalizedPrev.solarYear,
              normalizedPrev.solarMonth,
              normalizedPrev.solarDay
            );
            if (lunarDate) {
              return {
                ...normalizedPrev,
                calendarType: CalendarType.LUNAR,
                lunarYear: lunarDate.lunarYear,
                lunarMonth: lunarDate.lunarMonth,
                lunarDay: lunarDate.lunarDay,
                leap: lunarDate.isLeapMonth,
              };
            }
          } catch (e) {
            console.debug("convert date error", e);
          }
          return {
            ...normalizedPrev,
            calendarType: CalendarType.LUNAR,
          };
        }

        return normalizedPrev;
      });
    },
    []
  );

  const build = useCallback(() => {
    const normalizedState = normalizeDataState(dataState);
    if (normalizedState.calendarType === CalendarType.SOLAR) {
      if (
        normalizedState.solarYear &&
        normalizedState.solarMonth &&
        normalizedState.solarDay &&
        typeof normalizedState.bornTime === "number" &&
        typeof normalizedState.configType === "number" &&
        normalizedState.gender
      ) {
        props.updateConfig({
          calendarType: CalendarType.SOLAR,
          solarYear: normalizedState.solarYear,
          solarMonth: normalizedState.solarMonth,
          solarDay: normalizedState.solarDay,
          lunarYear: null,
          lunarMonth: null,
          lunarDay: null,
          leap: false,
          bornTime: normalizedState.bornTime,
          configType: normalizedState.configType,
          gender: normalizedState.gender === "F" ? Gender.F : Gender.M,
        });
      }
    } else if (normalizedState.calendarType === CalendarType.LUNAR) {
      if (
        normalizedState.lunarYear &&
        normalizedState.lunarMonth &&
        normalizedState.lunarDay &&
        typeof normalizedState.bornTime === "number" &&
        typeof normalizedState.configType === "number" &&
        normalizedState.gender
      ) {
        props.updateConfig({
          calendarType: CalendarType.LUNAR,
          lunarYear: normalizedState.lunarYear,
          lunarMonth: normalizedState.lunarMonth,
          lunarDay: normalizedState.lunarDay,
          leap: normalizedState.leap,
          solarYear: null,
          solarMonth: null,
          solarDay: null,
          bornTime: normalizedState.bornTime,
          configType: normalizedState.configType,
          gender: normalizedState.gender === "F" ? Gender.F : Gender.M,
        });
      }
    }
  }, [
    dataState,
    props.updateConfig,
  ]);

  return (
    <Card title="命盤設定" style={{ width: 600 }}>
      {"性別: "}
      <div className="inline-block">
        <select
          value={dataState.gender ?? ""}
          onChange={(e) =>
            setDataState((prev) => ({
              ...prev,
              gender: (e.target.value || null) as Gender | null,
            }))
          }
          style={{ ...selectStyle, width: 60 }}
        >
          <option value="">請選擇</option>
          {genderOptions.map((option) => (
            <option key={option.value} value={option.value}>
              {option.label}
            </option>
          ))}
        </select>
      </div>
      <LineSeparator />

      <div>
        <div className="inline-block">
          <label style={{ marginRight: 10 }}>
            <input
              type="radio"
              name="destiny-calendar-type"
              checked={dataState.calendarType === CalendarType.LUNAR}
              onChange={() => onChangeCalendarType(CalendarType.LUNAR)}
            />{" "}
            農曆
          </label>
          <label>
            <input
              type="radio"
              name="destiny-calendar-type"
              checked={dataState.calendarType === CalendarType.SOLAR}
              onChange={() => onChangeCalendarType(CalendarType.SOLAR)}
            />{" "}
            西曆
          </label>
        </div>
        <div
          className="inline-block"
          style={{ paddingLeft: 20, paddingRight: 0 }}
        >
          {dataState.calendarType === CalendarType.LUNAR ? (
            <LunarDateInput
              year={dataState.lunarYear}
              month={dataState.lunarMonth}
              day={dataState.lunarDay}
              leap={dataState.leap}
              onChangeYear={(value) =>
                setDataState((prev) =>
                  normalizeDataState({ ...prev, lunarYear: value })
                )
              }
              onChangeMonth={(value) =>
                setDataState((prev) =>
                  normalizeDataState({ ...prev, lunarMonth: value })
                )
              }
              onChangeDay={(value) =>
                setDataState((prev) =>
                  normalizeDataState({ ...prev, lunarDay: value })
                )
              }
              onChangeLeap={(value) =>
                setDataState((prev) =>
                  normalizeDataState({ ...prev, leap: value })
                )
              }
            />
          ) : null}
          {dataState.calendarType === CalendarType.SOLAR ? (
            <SolarDateInput
              year={dataState.solarYear}
              month={dataState.solarMonth}
              day={dataState.solarDay}
              onChangeYear={(value) =>
                setDataState((prev) =>
                  normalizeDataState({ ...prev, solarYear: value })
                )
              }
              onChangeMonth={(value) =>
                setDataState((prev) =>
                  normalizeDataState({ ...prev, solarMonth: value })
                )
              }
              onChangeDay={(value) =>
                setDataState((prev) =>
                  normalizeDataState({ ...prev, solarDay: value })
                )
              }
            />
          ) : null}
        </div>
      </div>
      <LineSeparator />
      <div>
        <div className="inline-block">
          {"時辰: "}
          <select
            value={
              typeof dataState.bornTime === "number"
                ? String(dataState.bornTime)
                : ""
            }
            onChange={(e) =>
              setDataState((prev) => ({
                ...prev,
                bornTime: e.target.value === "" ? null : Number(e.target.value),
              }))
            }
            style={{ ...selectStyle, width: 200 }}
          >
            <option value="">時辰</option>
            {bornTimeOptions.map((option) => (
              <option key={option.value} value={option.value}>
                {option.label}
              </option>
            ))}
          </select>
        </div>

        <div
          className="inline-block"
          style={{ paddingLeft: 20, paddingRight: 0 }}
        ></div>

        {"盤: "}
        <div className="inline-block">
          <select
            value={
              typeof dataState.configType === "number"
                ? String(dataState.configType)
                : ""
            }
            onChange={(e) =>
              setDataState((prev) => ({
                ...prev,
                configType:
                  e.target.value === "" ? null : Number(e.target.value),
              }))
            }
            style={{ ...selectStyle, width: 80 }}
          >
            <option value="">盤</option>
            {configTypeOptions.map((option) => (
              <option key={option.value} value={option.value}>
                {option.label}
              </option>
            ))}
          </select>
        </div>

        <div
          className="inline-block"
          style={{ paddingLeft: 20, paddingRight: 0 }}
        ></div>
      </div>
      <LineSeparator />
      <Button type="primary" onClick={build}>
        起盤
      </Button>
    </Card>
  );
};
