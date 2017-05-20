export default class Data {
    descent(a : null | string | number, b : null | string | number) {
        if (a == null) return 1;
        return (typeof(a) === 'string') ? a.localeCompare(b) : a - b;
    }

    ascent(a : null | string | number, b : null | string | number) {
        if (b == null) return 1;
        return (typeof(b) === 'string') ? b.localeCompare(a) : b - a;
    };
}

import Text from './Text';
import TextModel from './TextModel';
import SingleLineText from './SingleLineText';
import Item from './Item';
import TreeModel from './TreeModel';


export {
  TextModel: TextModel,
  ListModel: ListModel,
  TreeModel: TreeModel,

  Text: Text,
  SingleLineText: SingleLineText,
  
  Item: Item,
  ListItem: ListItem 
}