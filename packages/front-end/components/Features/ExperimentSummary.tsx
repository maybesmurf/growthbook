import {
  ExperimentRule,
  ExperimentValue,
  FeatureInterface,
  FeatureValueType,
} from "back-end/types/feature";
import ValueDisplay from "./ValueDisplay";
import Link from "next/link";
import { ExperimentInterfaceStringDates } from "back-end/types/experiment";
import { useDefinitions } from "../../services/DefinitionsContext";
import React, { useState } from "react";
import NewExperimentForm from "../Experiment/NewExperimentForm";
import { getExperimentDefinitionFromFeature } from "../../services/features";
import Modal from "../Modal";
import ExperimentSplitVisual from "./ExperimentSplitVisual";

const percentFormatter = new Intl.NumberFormat(undefined, {
  style: "percent",
  maximumFractionDigits: 2,
});

export default function ExperimentSummary({
  values,
  coverage,
  type,
  hashAttribute,
  trackingKey,
  experiment,
  feature,
  expRule,
}: {
  values: ExperimentValue[];
  coverage: number;
  type: FeatureValueType;
  hashAttribute: string;
  trackingKey: string;
  feature: FeatureInterface;
  experiment?: ExperimentInterfaceStringDates;
  expRule: ExperimentRule;
}) {
  // const totalPercent =
  //   coverage ?? getTotalVariationWeight(values.map((v) => v.weight));
  const { datasources, metrics } = useDefinitions();
  const [newExpModal, setNewExpModal] = useState(false);
  const [experimentInstructions, setExperimentInstructions] = useState(false);

  const expDefinition = getExperimentDefinitionFromFeature(feature, expRule);

  return (
    <div>
      {newExpModal && (
        <NewExperimentForm
          onClose={() => setNewExpModal(false)}
          source="feature-rule"
          isImport={true}
          fromFeature={true}
          msg="We couldn't find an analysis yet for that feature. Create a new one now."
          initialValue={expDefinition}
        />
      )}
      {experimentInstructions && (
        <Modal
          header={"Experiments need to be set up first"}
          open={true}
          size="lg"
          close={() => {
            setExperimentInstructions(false);
          }}
          cta={"Set up experiments"}
        >
          <div className="row">
            <div className="col-8 pl-2 mt-2">
              In order to view the results, you first have to set up experiments
              by connecting to your data source, and adding a metric.
              <div className="mt-5">
                <Link
                  href={`/experiments/?featureExperiment=${encodeURIComponent(
                    JSON.stringify(expDefinition)
                  )}`}
                >
                  <a className="btn btn-primary">Set up experiments</a>
                </Link>
              </div>
            </div>
            <div className="col-4">
              <img
                className=""
                src="/images/add-graph.svg"
                alt=""
                style={{ width: "100%", maxWidth: "200px" }}
              />
            </div>
          </div>
        </Modal>
      )}
      <div className="mb-3 row">
        <div className="col-auto">
          <strong>SPLIT</strong>
        </div>
        <div className="col-auto">
          {" "}
          users by{" "}
          <span className="mr-1 border px-2 py-1 bg-light rounded">
            {hashAttribute}
          </span>
          {expRule?.namespace && expRule?.namespace?.enabled && (
            <>
              {" "}
              <span>and include </span>
              <span className="mr-1 border px-2 py-1 bg-light rounded">
                {percentFormatter.format(
                  expRule.namespace.range[1] - expRule.namespace.range[0]
                )}
              </span>{" "}
              <span>of the namespace </span>
              <span className="mr-1 border px-2 py-1 bg-light rounded">
                {expRule.namespace.name}
              </span>
            </>
          )}
        </div>
      </div>
      <div className="mb-3 row">
        <div className="col-auto">
          <strong>INCLUDE</strong>
        </div>
        <div className="col-auto">
          <span className="mr-1 border px-2 py-1 bg-light rounded">
            {percentFormatter.format(coverage)}
          </span>{" "}
          of users
        </div>
      </div>
      <strong>SERVE</strong>

      <table className="table mt-1 mb-3 bg-light gbtable">
        <tbody>
          {values.map((r, j) => (
            <tr key={j}>
              <td
                className="text-muted position-relative"
                style={{ fontSize: "0.9em", width: 25 }}
              >
                <div
                  className={`${"variationColor" + (j % 9)}`}
                  style={{
                    width: "6px",
                    position: "absolute",
                    top: 0,
                    bottom: 0,
                    left: 0,
                  }}
                />
                {j}.
              </td>
              <td>
                <ValueDisplay value={r.value} type={type} />
              </td>
              <td>{r?.name}</td>
              <td>
                <div className="d-flex">
                  <div
                    style={{
                      width: "4em",
                      maxWidth: "4em",
                      margin: "0 0 0 auto",
                    }}
                  >
                    {percentFormatter.format(r.weight)}
                  </div>
                </div>
              </td>
            </tr>
          ))}
          <tr>
            <td colSpan={4}>
              <ExperimentSplitVisual
                values={values}
                coverage={coverage}
                label="Traffic split"
                unallocated="Unallocated (skips this rule)"
                type={type}
                showValues={false}
                stackLeft={true}
                showPercentages={true}
              />
            </td>
          </tr>
        </tbody>
      </table>
      <div className="row align-items-center">
        <div className="col-auto">
          <strong>TRACK</strong>
        </div>
        <div className="col">
          {" "}
          the split with the key{" "}
          <span className="mr-1 border px-2 py-1 bg-light rounded">
            {trackingKey}
          </span>{" "}
        </div>
        <div className="col-auto">
          {experiment ? (
            <Link href={`/experiment/${experiment.id}#results`}>
              <a className="btn btn-outline-primary">View results</a>
            </Link>
          ) : datasources.length > 0 && metrics.length > 0 ? (
            <a
              className="btn btn-outline-primary"
              href="#"
              onClick={(e) => {
                e.preventDefault();
                setNewExpModal(true);
              }}
              title="Create an experiment report from this rule"
            >
              View results
            </a>
          ) : (
            <a
              className="btn btn-outline-primary"
              title="Setup experiments to view results"
              onClick={(e) => {
                e.preventDefault();
                setExperimentInstructions(true);
              }}
            >
              View results
            </a>
          )}
        </div>
      </div>
    </div>
  );
}
