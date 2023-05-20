import React, {
  useEffect,
  useState,
  useRef,
  CSSProperties,
  Dispatch,
  SetStateAction,
  KeyboardEvent,
  ChangeEvent
} from "react";
import scrollIntoView from 'dom-scroll-into-view';
import isEqual from "lodash.isequal";
import Wrapper from './Wrapper';
import Trie from "./trie";

export interface AutoCompleteProps<T> {
  list: T[];
  getPropValue?: (list: T[]) => void;
  handleHighlight?: (item?: any) => void;
  handleSelect?: (item?: T | string, element?: HTMLDivElement) => void;
  handleNewValue?: (item: string) => void;
  updateIsOpen?: Dispatch<SetStateAction<boolean>>
  handleSubmit?: (item?: T | string) => void;
  updateSubmit?: (open: boolean) => void;
  inputProps?: object;
  isOpen?: boolean;
  disableOutsideClick?: boolean;
  highlightFirstItem?: boolean;
  showAll?: boolean;
  descending?: boolean;
  clearOnSelect?: boolean;
  submit?: boolean;
  clearOnSubmit?: boolean;
  wrapperStyle: CSSProperties;
  inputStyle: CSSProperties;
  dropDownStyle: CSSProperties;
  listItemStyle: CSSProperties;
  highlightedItemStyle: CSSProperties;
}

export interface MatchingItemsProps {
  originalIndex: number,
  value: string,
}

export interface TrieProps {
  insert: (value: string, index: number) => void,
  find: Function,
  contains: (value?: string) => any,
}

export default function AutoComplete<T>({
  list = [],
  getPropValue,
  handleHighlight,
  handleSelect,
  handleNewValue,
  inputProps,
  isOpen,
  updateIsOpen,
  disableOutsideClick = false,
  highlightFirstItem = true,
  showAll = false,
  descending = false,
  clearOnSelect = handleSelect ? true : false,
  submit,
  updateSubmit,
  handleSubmit,
  clearOnSubmit = true,
  wrapperStyle,
  inputStyle,
  dropDownStyle,
  listItemStyle,
  highlightedItemStyle = {
    backgroundColor: "dodgerBlue"
  }
}: AutoCompleteProps<T>) {

  const getPropValueRef = useRef<Function>();
  const updateRef = useRef<((open: boolean) => void)>();
  const submitRef = useRef<(item?: string) => void>();
  const trie = useRef<TrieProps>();
  const inputRef = useRef<HTMLInputElement>(null);
  const dropDownRef = useRef<HTMLDivElement>(null);
  const itemsRef = useRef<HTMLDivElement[]>([]);
  const [savedList, setSavedList] = useState<any[]>([]);
  const [open, setOpen] = useState<boolean>(false)
  const [matchingItems, setMatchingItems] = useState<MatchingItemsProps[]>([]);
  const [filteredItems, setFilteredItems] = useState<any[]>([]);
  const [savedFunction, setSavedFunction] = useState<string>();
  const [prefix, setPrefix] = useState<string>("");
  const [highlightedIndex, setHighlightedIndex] = useState<number>(highlightFirstItem ? 0 : -1);

  updateRef.current = updateIsOpen

  // If `list` is new - store it in the `savedList` state
  if (!isEqual(list, savedList)) {
    setSavedList(list)
  }
  // If `getPropValue` is new - store it as a string in the `savedFunction` state
  // Store the new `getPropValue` function in the `getPropValueRef`
  if (getPropValue && getPropValue.toString() !== savedFunction) {
    setSavedFunction(getPropValue.toString())
    getPropValueRef.current = getPropValue
  }

  // When `list` or `getPropValue` function changes - 
  // Create the `filteredItems` array with specified words to go into the trie
  // If `list` contains objects - use getPropvalueRef to map out desired words  
  useEffect(() => {
    if (Array.isArray(savedList)) {
      if (savedList.some(value => { return typeof value == "object" })) {
        if (getPropValueRef.current) {
          try {
            setFilteredItems(getPropValueRef.current(savedList))
          } catch (error) {
            console.error("Check the getPropValue function : the property value doesn't seem to exist", '\n', error)
          };
        } else if (!getPropValueRef.current) {
          console.error("Missing prop - 'getPropValue' is needed to get an object property value from 'list'")
          return
        }
      } else {
        setFilteredItems(savedList)
      }
    } else if (savedList === undefined) {
      return
    } else {
      console.error(`Ivalid PropType : The prop 'list' has a value of '${typeof savedList}' - list must be an array`)
      return
    };
  }, [savedList, savedFunction])

  //Insert the items in `filteredItems` into the trie
  useEffect(() => {
    console.log("trie")
    trie.current = new Trie();
    if (filteredItems) {
      for (let i = 0; i < filteredItems.length; i++) {
        const item = filteredItems[i]
        if (item && typeof item == 'number') {
          trie.current?.insert(item.toString(), i)
        } else if (item) {
          trie.current?.insert(item, i)
        };
      };
    };
  }, [filteredItems])

  // Runs when dropdown is open and the getPropValue function changes
  // Allows user to toggle property values in dropdown while its open
  useEffect(() => {
    console.log("IRAN")
    if (updateRef.current) { updateRef.current(open) }
    if (open) {
      if (inputRef.current?.value) {
        setMatchingItems(trie.current?.find(inputRef.current.value))
      } else {
        if (!inputRef.current?.value && showAll) {
          setMatchingItems(filteredItems.map((item, index) => ({ value: item, originalIndex: index })))
        } else if (!inputRef.current?.value && !showAll) {
          setMatchingItems([])
          setHighlightedIndex(highlightFirstItem === false ? -1 : 0)
          setOpen(false);
        }
      }
    } else {
      setMatchingItems([])
      setHighlightedIndex(highlightFirstItem === false ? -1 : 0)
      setOpen(false);
    }
  }, [filteredItems, open, prefix, highlightFirstItem, showAll])

  // Optionally control logic of dropdown by passing in desired state of open to `isOpen`
  useEffect(() => {
    console.log("IRAN2", isOpen)
    // if (!isOpen) {
    //   console.log("Hi")
    //   setOpen(false);
    // } else if (isOpen) {
    //   console.log("HEY")
    //   setOpen(true)
    // };
    if(isOpen !== undefined) {
       console.log("Hi")
      setOpen(isOpen)
    }
  }, [isOpen])


  // Runs the function passed in as `handleHighlight` prop
  // Passes in the higlighted element's `HTMLDivElement` & the string or object from the original list
  useEffect(() => {
    if (itemsRef.current[highlightedIndex] && handleHighlight) {
      handleHighlight(list[matchingItems[highlightedIndex]!.originalIndex])
    }
    itemsRef.current.length = matchingItems.length
  }, [handleHighlight, highlightedIndex, matchingItems, list])

  // If the input value is already a stored word the `handleSubmit` function runs
  // If the input value is not a stored word the handleNewValue function runs
  submitRef.current = () => {
    let match : {value : string, originalIndex : number} = trie.current?.contains(inputRef.current?.value);
    if (match && handleSubmit) {
      handleSubmit(list[match.originalIndex])
    } else if (handleNewValue && inputRef.current?.value) {
      handleNewValue(inputRef.current.value)
    } else if (handleSubmit) {
      handleSubmit(inputRef.current?.value)
    }
    resetOnSubmit(inputRef.current?.value)
  }

  // When submit is updated to `true` and text is entered into the input
  // The function stored in the `submitRef` will run the set submit back to false
  useEffect(() => {
    if (submit && inputRef.current?.value && submitRef.current) {
      submitRef.current()
    }
    if (updateSubmit) {
      updateSubmit(false)
    }
  }, [submit, updateSubmit])

  // Text input onChange sets value to prefix state and opens dropdown
  const handlePrefix = ({ target }: ChangeEvent<HTMLInputElement>) => {
    setPrefix(target.value)
    if (target.value) {
      setOpen(true)
    }
  };

  const handleKeyDown = (e: KeyboardEvent<HTMLInputElement>) => {
    // Down Arrow - sets the next index in the 'dropDownList' as the highlighted index
    // `scrollIntoView` scrolls the dropdown to keep highlight visible once it reaches the bottom 
    // If the highlighted index is the last index it resets the highlighted index back to 0
    if (e.key === 'ArrowDown' && matchingItems.length) {
      e.preventDefault()
      if (!itemsRef.current[highlightedIndex + 1]) {
        setHighlightedIndex(0)
        scrollIntoView(
          itemsRef.current[0],
          dropDownRef.current,
          { onlyScrollIfNeeded: true }
        )
      }
      if (itemsRef.current[highlightedIndex + 1]) {
        setHighlightedIndex(highlightedIndex + 1)
        scrollIntoView(
          itemsRef.current[highlightedIndex + 1],
          dropDownRef.current,
          { onlyScrollIfNeeded: true }
        )
      }
    }

    // Up Arrow - Moves highlight up the dropdown by setting highlighted index one index back
    // `scrollIntoView` scrolls the dropdown to keep highlight visible once it reaches the top 
    if (e.key === 'ArrowUp') {
      e.preventDefault()
      if (itemsRef.current[highlightedIndex - 1]) {
        setHighlightedIndex(highlightedIndex - 1)
        scrollIntoView(
          itemsRef.current[highlightedIndex - 1],
          dropDownRef.current,
          { onlyScrollIfNeeded: true }
        )
      }
    };

    // Enter key - Executes the `onSelect` function with the highlighted item's original value and it's `HTMLelement` if highlighted
    // If there is not a highlighted item it will pass the input's value into the 'onSelect' function
    // Then closes the dropdown and runs the `resetInputValue` function which uses `clearOnSelect` prop to clear the input or not
    if (e.key === 'Enter') {
      if (handleSubmit && !matchingItems.length && updateSubmit) {
        updateSubmit(true)
        return
      }
      if (list && matchingItems[highlightedIndex]) {
        if (handleSelect) {
          try {
            handleSelect(
              list[matchingItems[highlightedIndex]!.originalIndex],
              itemsRef.current[highlightedIndex]
            );
          } catch (error) {
            console.error("You must provide a valid function to the 'onSelect' prop", '\n', error)
          }
        }
        setOpen(false)
        resetInputValue(matchingItems[highlightedIndex]!.value)
      } else {
        if (inputRef.current?.value) {
          let match = trie.current?.contains(inputRef.current?.value);
          try {
            if (!match) {
              if (handleNewValue) {
                handleNewValue(inputRef.current.value)
              } else if (handleSelect) {
                handleSelect(inputRef.current.value)
              }
            } else if (handleSelect) {
              handleSelect(list[match.originalIndex])
            }
          } catch (error) {
            console.error("MISSING PROP: You must provide a valid function to the 'onSelect' prop", '\n', error)
          } finally {
            setOpen(false)
            resetInputValue(inputRef.current.value)
          }
        }
      }
    }
    // Tab key takes focus off the input and closes the dropdown 
    if (e.key === 'Tab') {
      setOpen(false)
    }
  }

  // When an item is clicked on - invokes the `onSelect` function with highlighted item's original value and it's `HTMLelement`
  // Then closes the dropdown and runs the `resetInputValue` function which uses `clearOnSelect` prop to clear the input or not
  const onMouseClick = (index: number, selectedElement: HTMLDivElement, matchingItem: string) => {
    if (handleSelect) {
      try {
        handleSelect(list[index], selectedElement)
      } catch (error) {
        console.error("You must provide a valid function to the 'onSelect' prop", '\n', error)
      }
    }
    setOpen(false)
    resetInputValue(matchingItem);
  }

  // Onscroll function determines the highlighted elements position within the dropdown
  // to keep the highlight inside the dropdown by moving the `highlightedIndex` up or down accordingly
  const scrollMe = () => {
    if (itemsRef.current[highlightedIndex] && dropDownRef.current) {
      let itemHeight = itemsRef.current[highlightedIndex]!.getBoundingClientRect().height
      let containerTop = Math.round(dropDownRef.current.getBoundingClientRect().top)
      let itemTop = Math.round(itemsRef.current[highlightedIndex]!.getBoundingClientRect().top)
      let height = Math.round(dropDownRef.current?.getBoundingClientRect().height)
      let bottom = containerTop + height
      if (containerTop > itemTop) {
        setHighlightedIndex(highlightedIndex + 1)
        scrollIntoView(
          itemsRef.current[highlightedIndex],
          dropDownRef.current,
          {
            alignWithTop: true,
            onlyScrollIfNeeded: true
          }
        )
      }
      if (bottom < itemTop + (itemHeight / 1.2)) {
        setHighlightedIndex(highlightedIndex - 1)
        scrollIntoView(
          itemsRef.current[highlightedIndex],
          dropDownRef.current,
          {
            alignWithTop: false,
            onlyScrollIfNeeded: true
          }
        )
      }
    }
  }

  // Creates a new Collator object and uses its compare method to natural sort the array
  var collator = new Intl.Collator(undefined, { numeric: true, sensitivity: 'base' });
  const sorted = matchingItems.sort(function (a: { value: string; }, b: { value: string; }) {
    if (!descending) {
      return collator.compare(a.value, b.value)
    } else {
      return collator.compare(b.value, a.value)
    }
  });

  const dropDownList = sorted.map((matchingItem: MatchingItemsProps, index: number) => {
    return (
      matchingItem.value !== undefined ?
        <div
          key={matchingItem.originalIndex}
          ref={el => itemsRef.current[index] = el!}
          className={highlightedIndex === index ? "dropdown-item highlited-item" : "dropdown-item"}
          style={highlightedIndex === index ? { ...highlightedItemStyle, ...listItemStyle } : { ...listItemStyle }}
          onClick={() => onMouseClick(matchingItem.originalIndex, itemsRef.current[index]!, matchingItem.value)}
          onMouseEnter={() => setHighlightedIndex(index)}
        >
          {matchingItem.value}
        </div>
        : null
    )
  })

  return (
    <Wrapper
      className="autocomplete-wrapper"
      disabled={disableOutsideClick}
      wrapperStyle={wrapperStyle}
      onOutsideClick={() => {
        if (matchingItems.length) {
          setOpen(false)
        }
      }}>
      <input
        className="autocomplete-input"
        style={inputStyle}
        ref={inputRef}
        type="search"
        {...inputProps}
        onChange={handlePrefix}
        onKeyDown={handleKeyDown}
        onFocus={() => setOpen(true)}
        autoComplete='off'
      />
      {dropDownList.length
        ?
        <div
          className="dropdown-container"
          ref={dropDownRef}
          style={dropDownStyle}
          onScroll={scrollMe}
        >
          {dropDownList}
        </div>
        :
        null}
    </Wrapper>
  )

  // Sets the value of the input to be what is specified in 'clearOnSelect' prop
  function resetInputValue(matchingItem: string) {
    if (inputRef.current) {
      if (clearOnSelect) {
        inputRef.current.value = "";
      } else {
        if (!matchingItem) {
          inputRef.current.value = ""
        } else {
          inputRef.current.value = matchingItem;
          inputRef.current.focus()
          setOpen(false)
        }
      }
    }
  }

  // Sets the value of the input to be what is specified in 'clearOnSubmit' prop
  function resetOnSubmit(matchingItem: string | undefined) {
    if (inputRef.current) {
      if (clearOnSubmit) {
        inputRef.current.value = "";
      } else {
        if (!matchingItem) {
          inputRef.current.value = ""
        } else {
          inputRef.current.value = matchingItem;
          inputRef.current?.focus()
          setOpen(false)
        }
      }
    }
  }
}