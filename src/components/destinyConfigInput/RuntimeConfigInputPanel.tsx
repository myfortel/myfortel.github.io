import { Card, Slider, Button } from "antd";
import { defaultCalendar } from "fortel-ziweidoushu";
import { useCallback, useState, useEffect } from "react";
import { RuntimeConfigDataStateType } from "../../view/buildBoard/stateMapper";
import { LunarDateInput } from "./LunarDateInput";
import { SolarDateInput } from "./SolarDateInput";
import type { SliderMarks } from "antd/es/slider";
import { CalendarType } from "fortel-ziweidoushu";
import { DateTime } from "luxon";
import { LineSeparator } from "./LineSeparator";

const marks: SliderMarks = {
  0: {
    style: {
      color: "#888",
    },
    label: "不顯示",
  },
  1: {
    style: {
      color: "#a00",
    },
    label: "大運",
  },
  2: {
    style: {
      color: "#00a",
    },
    label: "流年",
  },
  3: {
    style: {
      color: "#073",
    },
    label: "流月",
  },
  4: {
    style: {
      color: "#8000ff",
    },
    label: "流日",
  },
};

declare type DataState = {
  calendarType: CalendarType;
  lunarYear: number;
  lunarMonth: number;
  lunarDay: number;
  lunarLeap: boolean;
  solarYear: number;
  solarMonth: number;
  solarDay: number;
  scope: number;
};

export const RuntimeConfigInputPanel = (
  props: RuntimeConfigDataStateType & {
    updateRuntimeConfig: (dataState: RuntimeConfigDataStateType) => void;
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

  const normalizeLunarState = (state: DataState): DataState => {
    const lunarYear = state.lunarYear;
    const lunarMonth = clamp(state.lunarMonth, 1, 12);
    const monthInfo = getLunarMonthMaxDay(lunarYear, lunarMonth, state.lunarLeap);
    const lunarDay = clamp(state.lunarDay, 1, monthInfo.maxDay);
    return {
      ...state,
      lunarYear,
      lunarMonth,
      lunarDay,
      lunarLeap: monthInfo.leap,
    };
  };

  const [dataState, setDataState] = useState<DataState>({
    calendarType: props.calendarType ?? CalendarType.SOLAR,
    lunarYear: props.lunarYear ?? 1990,
    lunarMonth: props.lunarMonth ?? 1,
    lunarDay: props.lunarDay ?? 1,
    lunarLeap: props.leap ?? false,
    solarYear: props.solarYear ?? 1990,
    solarMonth: props.solarMonth ?? 1,
    solarDay: props.solarDay ?? 1,
    scope: props.scope ?? 0,
  });

  // const {
  //   calendarType,
  //   lunarYear,
  //   lunarMonth,
  //   lunarDay,
  //   lunarLeap,
  //   solarYear,
  //   solarMonth,
  //   solarDay,
  //   scope,
  // } = dataState;

  // const [calendarType, setCalendarType] = useState<CalendarType>(
  //   props.calendarType ?? CalendarType.SOLAR
  // );

  // const [lunarYear, setLunarYear] = useState<number | null>(
  //   props.lunarYear ?? 1990
  // );
  // const [lunarMonth, setLunarMonth] = useState<number | null>(
  //   props.lunarMonth ?? 1
  // );
  // const [lunarDay, setLunarDay] = useState<number | null>(props.lunarDay ?? 1);
  // const [lunarLeap, setLunarLeap] = useState<boolean>(props.leap ?? false);

  // const [solarYear, setSolarYear] = useState<number | null>(
  //   props.solarYear ?? 1990
  // );
  // const [solarMonth, setSolarMonth] = useState<number | null>(
  //   props.solarMonth ?? 1
  // );
  // const [solarDay, setSolarDay] = useState<number | null>(props.solarDay ?? 1);

  // const [scope, setScope] = useState<number>(props.scope ?? 0);

  const updateRuntimeConfig = useCallback(
    (state: DataState) => {
      props.updateRuntimeConfig({
        calendarType: state.calendarType,
        lunarYear: state.lunarYear ?? undefined,
        lunarMonth: state.lunarMonth ?? undefined,
        lunarDay: state.lunarDay ?? undefined,
        leap: state.lunarLeap,
        solarYear: state.solarYear ?? undefined,
        solarMonth: state.solarMonth ?? undefined,
        solarDay: state.solarDay ?? undefined,
        scope: state.scope,
      });
    },
    [props.updateRuntimeConfig]
  );

  const syncSolarLunarCalendar = useCallback(
    (dataState: DataState): DataState => {
      if (dataState.calendarType === CalendarType.LUNAR) {
        const normalized = normalizeLunarState(dataState);
        if (normalized.lunarYear && normalized.lunarMonth && normalized.lunarDay) {
          try {
            const solarDate = defaultCalendar.lunar2solar(
              normalized.lunarYear,
              normalized.lunarMonth,
              normalized.lunarDay,
              normalized.lunarLeap
            );
            if (solarDate) {
              return {
                ...normalized,
                solarYear: solarDate.solarYear,
                solarMonth: solarDate.solarMonth,
                solarDay: solarDate.solarDay,
              };
            }
          } catch (e) {
            console.debug("convert date error", e);
          }
        }
        return normalized;
      } else if (dataState.calendarType === CalendarType.SOLAR) {
        const solarYear = dataState.solarYear;
        const solarMonth = clamp(dataState.solarMonth, 1, 12);
        const solarDay = clamp(
          dataState.solarDay,
          1,
          getSolarMonthMaxDay(solarYear, solarMonth)
        );
        try {
          if (solarYear && solarMonth && solarDay) {
            const lunarDate = defaultCalendar.solar2lunar(
              solarYear,
              solarMonth,
              solarDay
            );
            if (lunarDate) {
              return {
                ...dataState,
                solarYear,
                solarMonth,
                solarDay,
                calendarType: CalendarType.SOLAR,
                lunarYear: lunarDate.lunarYear,
                lunarMonth: lunarDate.lunarMonth,
                lunarDay: lunarDate.lunarDay,
                lunarLeap: lunarDate.isLeapMonth,
              };
            }
          }
        } catch (e) {
          console.debug("convert date error", e);
        }
        return {
          ...dataState,
          solarYear,
          solarMonth,
          solarDay,
        };
      }
      return {
        ...dataState,
      };
    },
    []
  );

  const onChangeCalendarType = useCallback(
    (value: string | number) => {
      setDataState((prev) => {
        if (
          prev.calendarType === CalendarType.LUNAR &&
          value === CalendarType.SOLAR
        ) {
          try {
            const solarDate = defaultCalendar.lunar2solar(
              prev.lunarYear,
              prev.lunarMonth,
              prev.lunarDay,
              prev.lunarLeap
            );
            return {
              ...prev,
              calendarType: CalendarType.SOLAR,
              solarYear: solarDate.solarYear,
              solarMonth: solarDate.solarMonth,
              solarDay: solarDate.solarDay,
            };
          } catch (e) {
            console.debug("convert date error", e);
            return {
              ...prev,
              calendarType: CalendarType.SOLAR,
            };
          }
        }
        if (
          prev.calendarType === CalendarType.SOLAR &&
          value === CalendarType.LUNAR
        ) {
          try {
            const lunarDate = defaultCalendar.solar2lunar(
              prev.solarYear,
              prev.solarMonth,
              prev.solarDay
            );
            return {
              ...prev,
              calendarType: CalendarType.LUNAR,
              lunarYear: lunarDate.lunarYear,
              lunarMonth: lunarDate.lunarMonth,
              lunarDay: lunarDate.lunarDay,
              lunarLeap: lunarDate.isLeapMonth,
            };
          } catch (e) {
            console.debug("convert date error", e);
            return {
              ...prev,
              calendarType: CalendarType.LUNAR,
            };
          }
        }
        return prev;
      });
    },
    []
  );

  useEffect(() => {
    updateRuntimeConfig(dataState);
  }, [dataState, updateRuntimeConfig]);

  const goToday = useCallback(() => {
    const { year, month, day } = DateTime.now();
    const lunarDate = defaultCalendar.solar2lunar(year, month, day);
    setDataState((prev) =>
      syncSolarLunarCalendar({
        ...prev,
        calendarType: CalendarType.SOLAR,
        solarYear: year,
        solarMonth: month,
        solarDay: day,
        lunarYear: lunarDate.lunarYear,
        lunarMonth: lunarDate.lunarMonth,
        lunarDay: lunarDate.lunarDay,
        lunarLeap: lunarDate.isLeapMonth,
        scope: 4,
      })
    );
  }, [dataState, syncSolarLunarCalendar]);

  const goPrevTenYear = useCallback(() => {
    setDataState((prev) =>
      syncSolarLunarCalendar({
        ...prev,
        calendarType: CalendarType.LUNAR,
        lunarYear: prev.lunarYear - 10,
        lunarLeap: false,
        scope: 1,
      })
    );
  }, [syncSolarLunarCalendar]);

  const goNextTenYear = useCallback(() => {
    setDataState((prev) =>
      syncSolarLunarCalendar({
        ...prev,
        calendarType: CalendarType.LUNAR,
        lunarYear: prev.lunarYear + 10,
        lunarLeap: false,
        scope: 1,
      })
    );
  }, [syncSolarLunarCalendar]);

  const goPrevYear = useCallback(() => {
    setDataState((prev) =>
      syncSolarLunarCalendar({
        ...prev,
        calendarType: CalendarType.LUNAR,
        lunarYear: prev.lunarYear - 1,
        lunarLeap: false,
        scope: 2,
      })
    );
  }, [syncSolarLunarCalendar]);

  const goNextYear = useCallback(() => {
    setDataState((prev) =>
      syncSolarLunarCalendar({
        ...prev,
        calendarType: CalendarType.LUNAR,
        lunarYear: prev.lunarYear + 1,
        lunarLeap: false,
        scope: 2,
      })
    );
  }, [syncSolarLunarCalendar]);

  const goPrevMonth = useCallback(() => {
    setDataState((prev) =>
      syncSolarLunarCalendar({
        ...prev,
        calendarType: CalendarType.LUNAR,
        lunarYear: prev.lunarMonth > 1 ? prev.lunarYear : prev.lunarYear - 1,
        lunarMonth: prev.lunarMonth > 1 ? prev.lunarMonth - 1 : 12,
        lunarLeap: false,
        scope: 3,
      })
    );
  }, [syncSolarLunarCalendar]);

  const goNextMonth = useCallback(() => {
    setDataState((prev) =>
      syncSolarLunarCalendar({
        ...prev,
        calendarType: CalendarType.LUNAR,
        lunarYear: prev.lunarMonth < 12 ? prev.lunarYear : prev.lunarYear + 1,
        lunarMonth: prev.lunarMonth < 12 ? prev.lunarMonth + 1 : 1,
        lunarLeap: false,
        scope: 3,
      })
    );
  }, [syncSolarLunarCalendar]);

  const goPrevDay = useCallback(() => {
    setDataState((prev) => {
      const normalized = normalizeLunarState(prev);
      let solarDate;
      try {
        solarDate = defaultCalendar.lunar2solar(
          normalized.lunarYear,
          normalized.lunarMonth,
          normalized.lunarDay,
          normalized.lunarLeap
        );
      } catch (e) {
        console.debug("convert date error", e);
        return prev;
      }
      const { year, month, day } = DateTime.fromObject({
        year: solarDate.solarYear,
        month: solarDate.solarMonth,
        day: solarDate.solarDay,
        hour: 0,
        minute: 0,
        second: 0,
      }).minus({ day: 1 });
      const lunarDate = defaultCalendar.solar2lunar(year, month, day);
      return syncSolarLunarCalendar({
        ...normalized,
        calendarType: CalendarType.LUNAR,
        lunarYear: lunarDate.lunarYear,
        lunarMonth: lunarDate.lunarMonth,
        lunarDay: lunarDate.lunarDay,
        lunarLeap: lunarDate.isLeapMonth,
        scope: 4,
      });
    });
  }, [syncSolarLunarCalendar]);

  const goNextDay = useCallback(() => {
    setDataState((prev) => {
      const normalized = normalizeLunarState(prev);
      let solarDate;
      try {
        solarDate = defaultCalendar.lunar2solar(
          normalized.lunarYear,
          normalized.lunarMonth,
          normalized.lunarDay,
          normalized.lunarLeap
        );
      } catch (e) {
        console.debug("convert date error", e);
        return prev;
      }
      const { year, month, day } = DateTime.fromObject({
        year: solarDate.solarYear,
        month: solarDate.solarMonth,
        day: solarDate.solarDay,
        hour: 0,
        minute: 0,
        second: 0,
      }).plus({ day: 1 });
      const lunarDate = defaultCalendar.solar2lunar(year, month, day);
      return syncSolarLunarCalendar({
        ...normalized,
        calendarType: CalendarType.LUNAR,
        lunarYear: lunarDate.lunarYear,
        lunarMonth: lunarDate.lunarMonth,
        lunarDay: lunarDate.lunarDay,
        lunarLeap: lunarDate.isLeapMonth,
        scope: 4,
      });
    });
  }, [syncSolarLunarCalendar]);

  return (
    <Card style={{ width: 600 }} title="流曜顯示">
      <Slider
        style={{ width: 200 }}
        marks={marks}
        value={dataState.scope}
        min={0}
        max={4}
        onChange={(value) => {
          setDataState((prev) => ({ ...prev, scope: value }));
        }}
        tooltip={{ open: false }}
      />
      <div>
        <div className="inline-block">
          <label style={{ marginRight: 10 }}>
            <input
              type="radio"
              name="runtime-calendar-type"
              checked={dataState.calendarType === CalendarType.LUNAR}
              onChange={() => onChangeCalendarType(CalendarType.LUNAR)}
            />{" "}
            農曆
          </label>
          <label>
            <input
              type="radio"
              name="runtime-calendar-type"
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
              leap={dataState.lunarLeap}
              onChangeYear={(value) => {
                setDataState((prev) =>
                  syncSolarLunarCalendar({ ...prev, lunarYear: value })
                );
              }}
              onChangeMonth={(value) => {
                setDataState((prev) =>
                  syncSolarLunarCalendar({ ...prev, lunarMonth: value })
                );
              }}
              onChangeDay={(value) => {
                setDataState((prev) =>
                  syncSolarLunarCalendar({ ...prev, lunarDay: value })
                );
              }}
              onChangeLeap={(value) => {
                setDataState((prev) =>
                  syncSolarLunarCalendar({ ...prev, lunarLeap: value })
                );
              }}
            />
          ) : null}
          {dataState.calendarType === CalendarType.SOLAR ? (
            <SolarDateInput
              year={dataState.solarYear}
              month={dataState.solarMonth}
              day={dataState.solarDay}
              onChangeYear={(value) => {
                setDataState((prev) =>
                  syncSolarLunarCalendar({ ...prev, solarYear: value })
                );
              }}
              onChangeMonth={(value) => {
                setDataState((prev) =>
                  syncSolarLunarCalendar({ ...prev, solarMonth: value })
                );
              }}
              onChangeDay={(value) => {
                setDataState((prev) =>
                  syncSolarLunarCalendar({ ...prev, solarDay: value })
                );
              }}
            />
          ) : null}
        </div>
      </div>
      <LineSeparator />
      <div>
        <div className="inline-block" style={{ width: "100px", float: "left" }}>
          <Button onClick={goToday}>今日</Button>
        </div>
        <div className="inline-block" style={{ width: "400px", float: "left" }}>
          <div className="inline-block" style={{ width: "90px" }}>
            <div>
              <Button onClick={goPrevTenYear} style={{ width: "80px" }}>
                上十年
              </Button>
            </div>
            <div style={{ marginTop: 5 }}>
              <Button onClick={goNextTenYear} style={{ width: "80px" }}>
                下十年
              </Button>
            </div>
          </div>
          <div className="inline-block" style={{ width: "90px" }}>
            <div>
              <Button onClick={goPrevYear} style={{ width: "80px" }}>
                上年
              </Button>
            </div>
            <div style={{ marginTop: 5 }}>
              <Button onClick={goNextYear} style={{ width: "80px" }}>
                下年
              </Button>
            </div>
          </div>
          <div className="inline-block" style={{ width: "90px" }}>
            <div>
              <Button onClick={goPrevMonth} style={{ width: "80px" }}>
                上月
              </Button>
            </div>
            <div style={{ marginTop: 5 }}>
              <Button onClick={goNextMonth} style={{ width: "80px" }}>
                下月
              </Button>
            </div>
          </div>
          <div className="inline-block" style={{ width: "90px" }}>
            <div>
              <Button onClick={goPrevDay} style={{ width: "80px" }}>
                上日
              </Button>
            </div>
            <div style={{ marginTop: 5 }}>
              <Button onClick={goNextDay} style={{ width: "80px" }}>
                下日
              </Button>
            </div>
          </div>
        </div>
        <div style={{ clear: "both" }}></div>
      </div>
    </Card>
  );
};
