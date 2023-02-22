
// Typescript types
interface GeoJSONFeature {
  type: string;
  properties: {
    id: string;
    label?: string;
    label_es?: string;
    feature_type: string;
  };
  geometry: {
    type: string;
    coordinates: any[];
  }
}

interface Geography {
  type: string;
  features: GeoJSONFeature[],
}

interface MetricValue {
    [index: string]: {
      [index: string]: number;
    };
}

interface MetricOutput {
  // Computed metric values to be displayed on the map.
  map: MetricValue;

  // Corresponding weights, used for aggregation.
  w?: MetricValue;

  // Corresponding accuracy.
  a?: MetricValue;
}

type GeographyLevel = "blockgroup" | "tract";
interface MetricConfig {
  metric: string;
  category: string;
  prefix?: string;
  suffix?: string;
  subcategory?: string;
  title: string;
  title_es: string;
  label?: string;
  raw_label?: string;
  decimals: number;
  accuracy?: boolean;
  type: "sum" | "mean" | "weighted";
  geographies?: GeographyLevel[];
  world_val?: {
    [index: string]: number;
  };
}

export {
  Geography,
  MetricOutput,
  MetricConfig,
};
