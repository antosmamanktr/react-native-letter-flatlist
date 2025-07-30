import { ReactElement } from 'react';
import { ViewStyle, TextStyle } from 'react-native';

export interface AlphabetListProps<T = any> {
  data: T[];
  sortField: keyof T;
  renderItem?: (item: T) => ReactElement;
  renderHeader?: (letter: string) => ReactElement;
  showHeader?: boolean;
  showAllLetters?: boolean;
  itemHeight?: number;
  headerHeight?: number;

  itemTextStyle?: TextStyle;
  headerContainerStyle?: ViewStyle;
  headerTextStyle?: TextStyle;
  activeAlphabetStyle?: TextStyle;
  inactiveAlphabetStyle?: TextStyle;
  alphabetContainerStyles?: ViewStyle;
}

declare function AlphabetList<T = any>(props: AlphabetListProps<T>): ReactElement;

export default AlphabetList;
