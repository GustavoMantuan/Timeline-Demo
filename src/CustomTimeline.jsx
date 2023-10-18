import React, { useState, memo } from "react";
import moment from "moment";
import Timeline from "react-calendar-timeline";
import generateFakeData from "./generate-fake-data";
import { v4 as uuid } from "uuid";

const keys = {
  groupIdKey: "id",
  groupTitleKey: "title",
  groupRightTitleKey: "rightTitle",
  itemIdKey: "id",
  itemTitleKey: "title",
  itemDivTitleKey: "title",
  itemGroupKey: "group",
  itemTimeStartKey: "start",
  itemTimeEndKey: "end",
  groupLabelKey: "title"
};

const CustomTimeline = () => {
  const { groups, items } = generateFakeData();
  const defaultTimeStart = moment().startOf("day").toDate();
  const defaultTimeEnd = moment().startOf("day").add(1, "day").toDate();

  const [timelineState, setTimelineState] = useState({
    groups,
    items,
    defaultTimeStart,
    defaultTimeEnd
  });

  const handleItemMove = (itemId, dragTime, newGroupOrder) => {
    const { items, groups } = timelineState;

    const group = groups[newGroupOrder];

    setTimelineState({
      ...timelineState,
      items: items.map((item) =>
        item.id === itemId
          ? {
              ...item,
              start: dragTime,
              end: dragTime + (item.end - item.start),
              group: group.id
            }
          : item
      )
    });

    console.log("Moved", itemId, dragTime, newGroupOrder);
  };

  const handleItemResize = (itemId, time, edge) => {
    const { items } = timelineState;

    setTimelineState({
      ...timelineState,
      items: items.map((item) =>
        item.id === itemId
          ? {
              ...item,
              start: edge === "left" ? time : item.start,
              end: edge === "left" ? item.end : time
            }
          : item
      )
    });

    console.log("Resized", itemId, time, edge);
  };

  return (
    <Timeline
      groups={timelineState.groups}
      items={timelineState.items}
      keys={keys}
      fullUpdate
      itemTouchSendsClick={false}
      stackItems
      itemHeightRatio={0.75}
      canMove={true}
      canResize={"both"}
      defaultTimeStart={timelineState.defaultTimeStart}
      defaultTimeEnd={timelineState.defaultTimeEnd}
      onItemMove={handleItemMove}
      onItemResize={handleItemResize}
      onCanvasClick={(groupId, time, e) => {
        console.log(groupId, time, e);
      }}
    />
  );
};

export default memo(CustomTimeline);
