import * as React from "react";
import { useEffect, useState, useRef, useCallback } from "react"
import { SectionList, View, Text, SectionListData } from "react-native";
import sectionListGetItemLayout from "react-native-section-list-get-item-layout";
import { getSectionData } from "../../utils/getSectionData";
import { ListLetterIndex } from "../ListLetterIndex";
import { IData, ISectionData, AlphabetListProps } from "./types";
import { styles } from "./styles";
import { sizes } from "../../values/sizes";
import { DEFAULT_CHAR_INDEX } from "../../values/consts"

export const AlphabetList: React.FC<AlphabetListProps> = (props) => {
  const {
    data,
    index = DEFAULT_CHAR_INDEX,
    style,
    indexContainerStyle,
    indexLetterStyle,
    indexLetterContainerStyle,
    letterListContainerStyle,
    getItemHeight: onGetItemHeight = () => sizes.itemHeight,
    sectionHeaderHeight = sizes.itemHeight,
    listHeaderHeight = sizes.listHeaderHeight,
    uncategorizedAtTop = false,
    renderCustomSectionHeader,
    renderCustomItem,
    renderCustomListHeader,
    renderCustomIndexLetter,
    ...sectionListProps
  } = props
  
  const sectionListRef = useRef<SectionList>(null);
  const [sectionData, setSectionData] = useState<ISectionData[]>([])
  
  useEffect(() => {
    setSectionData(getSectionData(data, index, uncategorizedAtTop))
  }, [data, index, uncategorizedAtTop]) // Added missing dependencies
  
  // Memoize scroll function to prevent recreating on every render
  const onScrollToSection = useCallback((sectionIndex: number) => {
    const sectionList = sectionListRef.current;
    if (!sectionList) return
    
    // Add viewPosition for better UX - positions section at top
    sectionList.scrollToLocation({
      sectionIndex,
      itemIndex: 0,
      animated: true, // Smooth animation
      viewPosition: 0, // Scroll to top of view
    });
  }, []);
  
  // Memoize getItemLayout
  const onGetItemLayout: any = useCallback(
    sectionListGetItemLayout({
      getItemHeight: (_rowData, sectionIndex: number, rowIndex: number) => {
        return onGetItemHeight(sectionIndex, rowIndex)
      },
      getSectionHeaderHeight: () => sectionHeaderHeight,
      getSectionFooterHeight: () => 0,
      listHeaderHeight,
    }),
    [onGetItemHeight, sectionHeaderHeight, listHeaderHeight]
  );
  
  const onRenderSectionHeader = useCallback(({ section }: { section: SectionListData<IData> }) => {
    if (renderCustomSectionHeader) return renderCustomSectionHeader(section);
    return (
      <View testID="header" style={styles.sectionHeaderContainer}>
        <Text testID="header__label" style={styles.sectionHeaderLabel}>{section.title}</Text>
      </View>
    );
  }, [renderCustomSectionHeader]);
  
  const onRenderItem = useCallback(({ item }: { item: IData }) => {
    if (renderCustomItem) return renderCustomItem(item);
    return (
      <View testID="cell" style={styles.listItemContainer}>
        <Text testID="cell__label" style={styles.listItemLabel}>{item.value}</Text>
      </View>
    );
  }, [renderCustomItem]);
  
  return (
    <View style={[styles.container, style]}>
      <SectionList
        {...sectionListProps}
        testID="sectionList"
        ref={sectionListRef}
        sections={sectionData}
        keyExtractor={(item: IData) => item.key}
        renderItem={onRenderItem}
        renderSectionHeader={onRenderSectionHeader}
        ListHeaderComponent={renderCustomListHeader}
        getItemLayout={onGetItemLayout}
        stickySectionHeadersEnabled={true} // Keep section headers visible
        removeClippedSubviews={true} // Performance optimization
        maxToRenderPerBatch={10} // Render in smaller batches
        updateCellsBatchingPeriod={50} // Smoother scrolling
        windowSize={21} // Memory optimization
      />
      <ListLetterIndex
        sectionData={sectionData}
        onPressLetter={onScrollToSection}
        indexContainerStyle={indexContainerStyle}
        indexLetterStyle={indexLetterStyle}
        indexLetterContainerStyle={indexLetterContainerStyle}
        letterListContainerStyle={letterListContainerStyle}
        renderCustomIndexLetter={renderCustomIndexLetter}
      />
    </View>
  );
}
