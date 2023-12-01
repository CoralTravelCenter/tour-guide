import decisionTree from '../config/decision-tree.yaml'
import leasureKinds from '../config/leasure-kind-reference.yaml';

decisionTree.steps['dont-know-where-kind'].choices = leasureKinds.map(kind => {
    return {
        label: kind.label,
        actions: [{
            what: 'toggleBackdrop',
            predefined: kind.backdropVisual
        }]
    };
});

export const tourGuideConfig = decisionTree;