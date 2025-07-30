import React, { useRef, useMemo } from 'react';
import {
  View,
  Text,
  FlatList,
  TouchableOpacity,
  StyleSheet,
  ViewStyle,
  TextStyle,
  FlatListProps,
} from 'react-native';

type ListItem<T> =
  | { type: 'header'; value: string; key: string }
  | { type: 'item'; value: T; key: string };

export type AlphabetListProps<T> = {
  data: T[];
  sortField: keyof T;
  renderItem?: (item: T) => React.ReactElement;
  renderHeader?: (letter: string) => React.ReactElement;
  showHeader?: boolean;
  showAllLetters?: boolean;
  itemHeight?: number;
  headerHeight?: number;

  // Style props
  itemTextStyle?: TextStyle;
  headerContainerStyle?: ViewStyle;
  headerTextStyle?: TextStyle;
  activeAlphabetStyle?: TextStyle;
  inactiveAlphabetStyle?: TextStyle;
  alphabetContainerStyles?: ViewStyle;
};

function AlphabetList<T extends Record<string, any>>({
  data,
  sortField,
  renderItem,
  renderHeader,
  showHeader = true,
  showAllLetters = false,
  itemHeight = 40,
  headerHeight = 40,
  itemTextStyle,
  headerContainerStyle,
  headerTextStyle,
  activeAlphabetStyle,
  inactiveAlphabetStyle,
  alphabetContainerStyles,
}: AlphabetListProps<T>) {
  const flatListRef = useRef<FlatList<ListItem<T>>>(null);
  const letterIndexMap = useRef<Record<string, number>>({});
  const availableLetters = useRef<Set<string>>(new Set());

  const flatListData = useMemo(() => {
    const sortedData = [...data].sort((a, b) =>
      String(a[sortField]).localeCompare(String(b[sortField]))
    );

    const list: ListItem<T>[] = [];
    const indexMap: Record<string, number> = {};
    const foundLetters = new Set<string>();
    let currentLetter = '';

    sortedData.forEach((item, index) => {
      const label = String(item[sortField]);
      const letter = label[0]?.toUpperCase() ?? '#';
      foundLetters.add(letter);

      if (showHeader && letter !== currentLetter) {
        currentLetter = letter;
        indexMap[letter] = list.length;
        list.push({
          type: 'header',
          value: letter,
          key: `header-${letter}`,
        });
      }

      if (!showHeader && indexMap[letter] === undefined) {
        indexMap[letter] = list.length;
      }

      list.push({
        type: 'item',
        value: item,
        key: `item-${index}`,
      });
    });

    letterIndexMap.current = indexMap;
    availableLetters.current = foundLetters;
    return list;
  }, [data, sortField, showHeader]);

  const getItemLayout: FlatListProps<ListItem<T>>['getItemLayout'] = (_, index) => {
    const item = flatListData[index];
    const height = item.type === 'header' ? headerHeight : itemHeight;
    const offset = flatListData
      .slice(0, index)
      .reduce(
        (sum, i) => sum + (i.type === 'header' ? headerHeight : itemHeight),
        0
      );
    return { length: height, offset, index };
  };

  const handleAlphabetPress = (letter: string) => {
    const index = letterIndexMap.current[letter];
    if (index !== undefined) {
      flatListRef.current?.scrollToIndex({ index, animated: true });
    }
  };

  const renderFlatListItem = ({ item }: { item: ListItem<T> }) => {
    if (item.type === 'header') {
      if (!showHeader) return null;
      return renderHeader ? (
        renderHeader(item.value)
      ) : (
        <View style={[styles.defaultHeaderContainer, headerContainerStyle]}>
          <Text style={[styles.defaultHeaderText, headerTextStyle]}>
            {item.value}
          </Text>
        </View>
      );
    }

    return renderItem ? (
      renderItem(item.value)
    ) : (
      <Text style={[styles.defaultItem, itemTextStyle]}>
        {String(item.value[sortField])}
      </Text>
    );
  };

  const alphabetList = showAllLetters
    ? [...'ABCDEFGHIJKLMNOPQRSTUVWXYZ']
    : Array.from(availableLetters.current).sort();

  return (
    <View style={styles.container}>
      <FlatList
        ref={flatListRef}
        data={flatListData}
        keyExtractor={(item) => item.key}
        renderItem={renderFlatListItem}
        getItemLayout={getItemLayout}
        style={{ flexGrow: 1 }}
        contentContainerStyle={{ flexGrow: 1 }}
        showsVerticalScrollIndicator={false}
      />

      <View style={[styles.alphabetContainer, alphabetContainerStyles]}>
        {alphabetList.map((letter) => {
          const isDisabled = !availableLetters.current.has(letter);
          return (
            <TouchableOpacity
              key={letter}
              disabled={isDisabled}
              onPress={() => handleAlphabetPress(letter)}
            >
              <Text
                style={[
                  styles.alphabet,
                  isDisabled
                    ? inactiveAlphabetStyle || styles.disabledAlphabet
                    : activeAlphabetStyle,
                ]}
              >
                {letter}
              </Text>
            </TouchableOpacity>
          );
        })}
      </View>
    </View>
  );
}

export default AlphabetList;

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  defaultItem: {
    height: 40,
    justifyContent: 'center',
    paddingHorizontal: 16,
    fontSize: 16,
    color: '#333',
  },
  defaultHeaderContainer: {
    height: 40,
    backgroundColor: '#f0f0f0',
    justifyContent: 'center',
    paddingHorizontal: 16,
  },
  defaultHeaderText: {
    fontWeight: 'bold',
    fontSize: 18,
    textTransform: 'uppercase',
    color: '#000',
  },
  alphabetContainer: {
    position: 'absolute',
    right: 0,
    top: 0,
    bottom: 0,
    justifyContent: 'center',
    paddingHorizontal: 6,
  },
  alphabet: {
    fontSize: 12,
    paddingVertical: 2,
    textAlign: 'center',
  },
  disabledAlphabet: {
    color: '#bbb',
  },
});
