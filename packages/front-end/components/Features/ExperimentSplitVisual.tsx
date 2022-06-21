import clsx from "clsx";
import styles from "./ExperimentSplitVisual.module.scss";
import React, { CSSProperties } from "react";
import { ExperimentValue, FeatureValueType } from "back-end/types/feature";
import Tooltip from "../Tooltip";
import { FaExclamationTriangle } from "react-icons/fa";

export interface Props {
  label?: string;
  unallocated?: string;
  coverage: number;
  values: ExperimentValue[];
  showValues?: boolean;
  type: FeatureValueType;
  stackLeft?: boolean;
  showPercentages?: boolean;
}
export default function VariationsInput({
  label = "Traffic Split Preview",
  unallocated = "Not included",
  coverage,
  values,
  showValues = false,
  type,
  stackLeft = false,
  showPercentages = true,
}: Props) {
  let previewLeft = 0;
  const totalWeights = parseFloat(
    values.reduce((partialSum, v) => partialSum + v.weight, 0).toFixed(3)
  );

  return (
    <div className={`${totalWeights > 1 ? "overflow-hidden" : ""}`}>
      <div className="row">
        <div className="col">
          <label>{label}</label>
          {totalWeights !== 1 && (
            <span className="ml-2 text-danger">
              <FaExclamationTriangle className="text-danger mr-2" />
              <span className="">Please adjust weights to sum to 100.</span>
            </span>
          )}
        </div>
        <div className={clsx("col-auto", styles.legend)} />
        <div className={clsx("col-auto", styles.legend)}>
          <div
            className={clsx(
              styles.legend_box,
              styles.used,
              "progress-bar-striped"
            )}
            style={{ backgroundColor: "#e0e0e0" }}
          />{" "}
          {unallocated}{" "}
          <strong>
            ({parseFloat(((1 - coverage) * 100).toPrecision(5)) + "%"})
          </strong>
        </div>
      </div>
      <div
        className="position-relative progress-bar-striped mb-5"
        style={{
          width: "100%",
          textAlign: "right",
          height: 30,
          backgroundColor: "#e0e0e0",
        }}
      >
        <div className="d-flex flex-row">
          <div className="w-100 d-flex flex-row">
            {values.map((val, i) => {
              const thisLeft = previewLeft;
              previewLeft += 100 * val.weight;
              const additionalStyles: CSSProperties = {
                width: (val.weight ? val.weight * coverage * 100 : 0) + "%",
                height: 30,
              };
              if (!stackLeft) {
                additionalStyles.position = "absolute";
                additionalStyles.left = thisLeft + "%";
              }

              const variationLabel =
                (val?.name
                  ? val.name
                  : type === "boolean"
                  ? val.value === "true"
                    ? "on"
                    : "off"
                  : val.value) +
                " (" +
                parseFloat(
                  (val.weight ? val.weight * coverage * 100 : 0).toPrecision(5)
                ) +
                "%)";
              return (
                <div
                  key={i}
                  className={`${styles.previewBar} ${
                    "variationColor" + (i % 9)
                  }`}
                  style={additionalStyles}
                >
                  <Tooltip
                    text={variationLabel}
                    style={{ width: "100%", height: "100%" }}
                  >
                    <></>
                  </Tooltip>
                  {showPercentages && (
                    <div className={`${styles.percentMarker}`}>
                      <span>
                        {parseFloat(
                          (val.weight
                            ? val.weight * coverage * 100
                            : 0
                          ).toPrecision(4)
                        ) + "%"}
                        {showValues && (
                          <>
                            {" "}
                            -{" "}
                            <strong>
                              {val?.name
                                ? val.name
                                : type === "boolean"
                                ? val.value === "true"
                                  ? "on"
                                  : "off"
                                : val.value}
                            </strong>
                          </>
                        )}
                      </span>
                    </div>
                  )}
                </div>
              );
            })}
            {stackLeft && coverage < 1 && (
              <div
                className={`${styles.previewBar} unallocated`}
                style={{
                  position: "relative",
                  width: (1 - coverage) * 100 + "%",
                  height: 30,
                }}
              >
                <Tooltip
                  text={`Unallocated: ${parseFloat(
                    ((1 - coverage) * 100).toPrecision(5)
                  )}% - users will skip this rule`}
                  style={{ width: "100%", height: "100%" }}
                >
                  <></>
                </Tooltip>
                {showPercentages && (
                  <div className={`${styles.percentMarker}`}>
                    <span>
                      {parseFloat(((1 - coverage) * 100).toPrecision(5)) + "%"}
                      {showValues && (
                        <>
                          {" "}
                          - <strong>unallocated</strong>
                        </>
                      )}
                    </span>
                  </div>
                )}
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
