const entityTypes = ["school", "company", "college"] as const;
type EntityType = (typeof entityTypes)[number];

export const assertEntityType = (
  entityType: string,
): asserts entityType is EntityType => {
  if (!entityTypes.includes(entityType as EntityType)) {
    throw new Error(`Invalid entity type: ${entityType}`);
  }
};

export const getCaptationFormUrl = (entityType: EntityType) => {
  const url = useRuntimeConfig().public.captation.formUrls[entityType];
  return url;
};

export const getCaptationDataFromLocalStorage = () => {
  const data = localStorage.getItem("captationData");
  return data ? JSON.parse(data) : null;
};

export const deleteCaptationDataFromLocalStorage = () => {
  localStorage.removeItem("captationData");
};

export const setCaptationDataToLocalStorage = (
  data: Record<string, unknown>,
) => {
  localStorage.setItem("captationData", JSON.stringify(data));
};
