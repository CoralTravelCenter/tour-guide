import decisionTree from '../config/decision-tree.yaml'
import leisureKinds from '../config/leisure-kind-reference.yaml';
import destinationDefs from '../config/destinations.yaml';
import departuresDef from '../config/departures.yaml';

decisionTree.steps['dont-know-where-kind'].choices = leisureKinds.map(kind => {
    return {
        label: kind.label,
        kindKey: kind.id,
        actions: [{
            what: 'toggleBackdrop',
            predefined: kind.backdropVisual
        }]
    };
});

export const tourGuideConfig = decisionTree;
export const destinations = destinationDefs;
export const departures = departuresDef;