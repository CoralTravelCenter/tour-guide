import tourGuideConfig from '../config/decision-tree.yaml'
import leasureKinds from '../config/leasure-kind-reference.yaml';

tourGuideConfig.steps['dont-know-where-kind'].choices = leasureKinds.map(kind => {
    return {
        label: kind.label,
        actions: [{
            what: 'toggleBackdrop',
            predefined: kind.backdropVisual
        }]
    };
});

export default tourGuideConfig;