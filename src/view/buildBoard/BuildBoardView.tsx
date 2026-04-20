import { DestinyBoard, DestinyConfig } from "fortel-ziweidoushu";
import { Board } from "../../components/Board";
import { DestinyConfigInputPanel } from "../../components/destinyConfigInput/DestinyConfigInputPanel";
import { useState, useCallback, useMemo } from "react";
import { MainMenu } from "../../components/MainMenu";
import { useSearchParams } from "react-router-dom";
import {
  searchParamsToDataStateMapper,
  dataStateToDestinyConfigMapper,
  ConfigDataStateType,
  RuntimeConfigDataStateType,
} from "./stateMapper";
import { RuntimeConfigInputPanel } from "../../components/destinyConfigInput/RuntimeConfigInputPanel";

export const BuildBoardView = () => {
  const [searchParams] = useSearchParams();

  /**
   * parse search params => config data
   */
  const initialDataState = useMemo(() => {
    return searchParamsToDataStateMapper(searchParams);
  }, [searchParams]);

  const [configDataState, setConfigDataState] = useState<ConfigDataStateType>(
    initialDataState.config
  );

  const [runtimeConfigDataState, setRuntimeConfigDataState] =
    useState<RuntimeConfigDataStateType>(initialDataState?.runtimeConfig ?? {});

  const destinyConfig = useMemo<DestinyConfig | null>(() => {
    return (configDataState && dataStateToDestinyConfigMapper(configDataState)) ?? null;
  }, [configDataState]);

  const validDestinyBoard = useMemo(() => {
    try {
      return destinyConfig && new DestinyBoard(destinyConfig) && true;
    } catch (e) {
      return false;
    }
  }, [destinyConfig]);

  const updateConfig = useCallback(
    (updatedState: ConfigDataStateType) => {
      setConfigDataState((prev) => {
        if (JSON.stringify(updatedState) === JSON.stringify(prev)) {
          return prev;
        }
        setRuntimeConfigDataState({});
        return updatedState;
      });
    },
    []
  );

  const updateRuntimeConfigDataState = useCallback(
    (updatedState: RuntimeConfigDataStateType) => {
      setRuntimeConfigDataState((prev) => {
        if (JSON.stringify(updatedState) === JSON.stringify(prev)) {
          return prev;
        }
        return updatedState;
      });
    },
    []
  );

  return (
    <>
      <MainMenu defaultValue="buildBoard" />
      <DestinyConfigInputPanel
        updateConfig={updateConfig}
        {...configDataState}
      ></DestinyConfigInputPanel>

      <div style={{ marginTop: 15 }}></div>

      <RuntimeConfigInputPanel
        updateRuntimeConfig={updateRuntimeConfigDataState}
        {...runtimeConfigDataState}
      ></RuntimeConfigInputPanel>

      <div style={{ marginTop: 15 }}></div>

      {destinyConfig && validDestinyBoard ? (
        <Board
          destinyConfig={destinyConfig}
          runtimeConfigDataState={runtimeConfigDataState}
        ></Board>
      ) : null}
    </>
  );
};
