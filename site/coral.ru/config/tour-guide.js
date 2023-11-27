import tourGuideConfig from '../config/decision-tree.yaml'
import leasureKinds from '../config/leasure-kind-reference.yaml';

tourGuideConfig.steps['dont-know-where-kind'].choices = leasureKinds.map(kind => {
    return { label: kind.label };
});

export default tourGuideConfig;