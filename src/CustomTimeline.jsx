import React, { useState, memo } from "react";
import moment from "moment";
import Timeline from "react-calendar-timeline";
import generateFakeData from "./generate-fake-data";
import DeleteIcon from "./DeleteIcon";

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
  groupLabelKey: "title",
};

const CustomTimeline = () => {
  const { groups, items } = generateFakeData();
  const defaultTimeStart = moment().startOf("day").toDate();
  const defaultTimeEnd = moment().startOf("day").add(1, "day").toDate();
  const [selectedItemsIdsSet, setSelectedItems] = useState(new Set())
  const [selectedItemsIds, setSelectedItemsIds] = useState([])

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

  const handleItemSelect = (itemId) => {
    // handle situation where we need to deselect all other items first, since we do not allow multiple select so far
    handleItemDeselect()
    selectedItemsIdsSet.add(itemId)
    setSelectedItems(selectedItemsIdsSet)
    setSelectedItemsIds([...selectedItemsIdsSet])
    const { items } = timelineState;
    const updatedArray = items.map(obj => 
      obj.id === itemId ? { ...obj, itemProps: {...obj.itemProps, selected: true }} : {...obj, itemProps: {...obj.itemProps, selected: false }}
    );
    setTimelineState(prevState => {
      return {
        ...prevState,
        items: [
          ...updatedArray
        ]
      }
    });
  }

  const handleItemDeselect = () => {
    try {
      const values = selectedItemsIdsSet.values();
      const currentId = values.next()
      selectedItemsIdsSet.delete(currentId.value)
      setSelectedItems(selectedItemsIdsSet)
      setSelectedItemsIds([...selectedItemsIdsSet])

      const { items } = timelineState;
      const updatedArray = items.map(obj => 
        obj.id === currentId.value ? { ...obj, itemProps: {...obj.itemProps, selected: false }} : obj
      );
      setTimelineState(prevState => {
        return {
          ...prevState,
          items: [
            ...updatedArray
          ]
        }
      });

    } finally {
      return
    }
  }

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

  const handleEditItemClick = (itemId) => {
    const { items } = timelineState;
    const editItem = items.filter((item) => item.id === itemId)[0]

    // find document by id
    if (!editItem) {
      return
    }
    const editItemElementDom = document.getElementById(`${editItem.id}`);
    editItemElementDom.classList.add('editable-content')
    editItemElementDom.children[0].contentEditable = "true";
    editItemElementDom.children[0].focus()
  }

  const handleEditItem = (e, activeItem) => {
    const { items } = timelineState;
    const updatedArray = items.map(obj => 
      obj.id === activeItem.id ? { ...obj, title: e.target.innerText } : obj
    );
    setTimelineState({
      ...timelineState,
      items: [
        ...updatedArray
      ]
    });

    e.target.offsetParent.classList.remove('editable-content');
    e.target.contentEditable = "false";
  }

  const handleDeleteItem = (e, itemId) => {
    const { items } = timelineState;
    setTimelineState({
      ...timelineState,
      items: items.filter((item) => item.id !== itemId)
    });
  }

  const handleAddItem = (groupId, time, e) => {
    const { items } = timelineState;
    const newId =  items.length + 1
    const newItem = {
      id: newId,
      group: groupId,
      title: 'New Item',
      start: time,
      end: new Date(time + 3600000), // set end time to 1 hour later
      itemProps: {
        selected: true,
        "data-tip": 'New Item',
      }
    };

    setTimelineState({
      ...timelineState,
      items: [
        ...items,
        newItem
      ]
    })

    selectedItemsIdsSet.add(newId)
    setSelectedItems(selectedItemsIdsSet)
    setSelectedItemsIds([...selectedItemsIdsSet])

    // let's give a better user ux
    setTimeout(() => {
      const dbClick = new MouseEvent('dblclick', {
        'view': window,
        'bubbles': true,
        'cancelable': true
      });
      document.getElementById(newId).dispatchEvent(dbClick);
    }, 500)
  }

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
      onItemSelect={handleItemSelect}
      onItemDeselect={handleItemDeselect}
      canResize={"both"}
      itemRenderer={({
        item,
        itemContext,
        getItemProps,
        getResizeProps
      }) => {
        const { left: leftResizeProps, right: rightResizeProps } = getResizeProps()
        const { selected = false } = item.itemProps

        return (
          <div
            id={`${item.id}`}
            {...getItemProps(item.itemProps)}
            >              
            {itemContext.useResizeHandle ? <div {...leftResizeProps} /> : ''}

            <span
              onBlur={(e) => handleEditItem(e, item)}
              className="rct-item-content"
              style={{ maxHeight: `${itemContext.dimensions.height}` }}
            >
              {itemContext.title}
            </span>

            {selected && (
              <div onClick={(e) => handleDeleteItem(e, item.id)}>
                <DeleteIcon />
              </div>
            )}

            {itemContext.useResizeHandle ? <div {...rightResizeProps} /> : ''}
          </div>
        )}
      }
      defaultTimeStart={timelineState.defaultTimeStart}
      defaultTimeEnd={timelineState.defaultTimeEnd}
      onItemMove={handleItemMove}
      onItemResize={handleItemResize}
      onItemDoubleClick={handleEditItemClick}
      onCanvasDoubleClick={handleAddItem}
      selected={selectedItemsIds}
    />
  );
};

export default memo(CustomTimeline);
