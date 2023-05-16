import { useEffect, useState, useRef, useReducer } from "react";
import scrollIntoView from 'dom-scroll-into-view';
import isEqual from "lodash.isequal";
import Wrapper from './Wrapper';
import Trie from "./trie";

export interface AutoCompleteProps {
  list: [];
  getPropValue?: Function;
  handleHighlight?: Function;
  handleSelect?: Function;
  handleNewValue?: Function;
  inputProps?: object;
  isOpen?: boolean;
  updateIsOpen?: Function;
  disableOutsideClick?: boolean;
  highlightFirstItem?: boolean;
  showAll?: boolean;
  descending?: boolean;
  clearOnSelect?: boolean;
  submit?: boolean;
  updateSubmit?: Function;
  handleSubmit?: Function;
  clearOnSubmit?: boolean;
  wrapperStyle?: object;
  inputStyle?: object;
  dropDownStyle?: object;
  listItemStyle?: object;
  highlightedItemStyle?: object;
}

export interface MatchingItemsProps {
  originalIndex: number,
  value: string,
}

export default function AutoComplete({
  list = [],
  getPropValue = () => { },
  handleHighlight = () => { },
  handleSelect = () => { },
  handleNewValue = () => { },
  inputProps,
  isOpen,
  updateIsOpen = () => { },
  disableOutsideClick = false,
  highlightFirstItem = true,
  showAll = false,
  descending = false,
  clearOnSelect = handleSelect ? true : false,
  submit,
  updateSubmit = () => { },
  handleSubmit = () => { },
  clearOnSubmit = true,
  wrapperStyle = {},
  inputStyle,
  dropDownStyle,
  listItemStyle,
  highlightedItemStyle = {
    backgroundColor: "dodgerBlue"
  }
}: AutoCompleteProps) {

  const getPropValueRef = useRef<Function>();
  const updateRef = useRef<Function>(updateIsOpen);
  const submitRef = useRef<Function>();
  const matchingItemsRef = useRef<MatchingItemsProps[]>([]);
  const trie = useRef<any>();
  const inputRef = useRef<HTMLInputElement>(null);
  const dropDownRef = useRef<HTMLDivElement>(null);
  const itemsRef = useRef<HTMLDivElement[]>([]);
  const [savedList, setSavedList] = useState<string[]>([]);
  const [matchingItems, setMatchingItems] = useState<MatchingItemsProps[]>([]);
  const [filteredItems, setFilteredItems] = useState<any[]>([]);
  const [savedFunction, setSavedFunction] = useState<string>();
  const [highlightedIndex, setHighlightedIndex] = useState<number>(highlightFirstItem ? 0 : -1);

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
    console.log('useEffect')
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
    trie.current = new Trie();
    if (filteredItems) {
      for (let i = 0; i < filteredItems.length; i++) {
        const item = filteredItems[i]
        if (item && typeof item == 'number') {
          trie.current.insert(item.toString(), i)
        } else if (item) {
          trie.current.insert(item, i)
        };
      };
    };
  }, [filteredItems])

  // Runs when dropdown is open and the getPropValue function changes
  // Allows user to toggle property values in dropdown while its open
  useEffect(() => {
    if (matchingItemsRef.current.length) {
      setMatchingItems(filteredItems.map((item, index) => ({ value: item, originalIndex: index })))
    }
  }, [filteredItems])

  // Opens dropdown when isOpen is passed from parent as `true` - close when `false`
  // `handleUpdateIsOpen` function runs when the dropdown is opened/closed by the child -
  // it sends the updated state of `isOpen` back to the parent
  useEffect(() => {
    if (updateRef.current && !isOpen) {
      setMatchingItems([])
    } else if (updateRef.current && isOpen) {
      if (inputRef.current) { inputRef.current.focus() }
      if (showAll && !inputRef.current?.value) {
        if (filteredItems) {
          setMatchingItems(filteredItems.map((item, index) => ({ value: item, originalIndex: index })))
        }
      } else if (showAll && inputRef.current?.value) {
        setMatchingItems(trie.current.find(inputRef.current.value))
      } else if (!showAll && inputRef.current?.value) {
        setMatchingItems(trie.current.find(inputRef.current.value))
      }
    };
  }, [isOpen, showAll, filteredItems])

  // Runs the function passed in as `handleHighlight` prop
  // Passes in the higlighted element's `HTMLDivElement` & the string or object from the original list
  useEffect(() => {
    if (itemsRef.current[highlightedIndex] && handleHighlight) {
      handleHighlight(list[matchingItems[highlightedIndex]!.originalIndex])
    }
  }, [handleHighlight, highlightedIndex, matchingItems, list])

  // If the input value is already a stored word the `handleSubmit` function runs
  // If the input value is not a stored word the handleNewValue function runs
  submitRef.current = () => {
    let match = trie.current.contains(inputRef.current?.value);
    if (match) {
      handleSubmit(list[match.originalIndex])
    } else if (handleNewValue) {
      handleNewValue(inputRef.current?.value.toString())
    } else {
      handleSubmit(inputRef.current?.value.toString())
    }
    resetOnSubmit(inputRef.current?.value)
  }

  // When submit is updated to `true` and text is entered into the input
  // The function stored in the `submitRef` will run the set submit back to false
  useEffect(() => {
    if (submit && inputRef.current?.value && submitRef.current) {
      submitRef.current()
    }
    updateSubmit(false)
  }, [submit, updateSubmit])

  // Handles text input and if `showAll` is true it opens the dropdown when input is focused
  // Runs the trie's `find` method to search for words that match the text input
  const handlePrefix = (event: { target: { value: string; }; }) => {
    const prefix = event.target.value
    if (!highlightFirstItem) {
      setHighlightedIndex(1)
    }
    if (filteredItems && showAll && prefix.length === 0) {
      setMatchingItems(filteredItems.map((item, index) => ({value: item,originalIndex: index})))
      handleUpdateIsOpen(true)
      return
    }
    if (prefix.length > 0) {
      setMatchingItems(trie.current.find(event.target.value))
      handleUpdateIsOpen(true)
    } else if (matchingItems.length) {
  
      setMatchingItems([])
      handleUpdateIsOpen(false)
    }
    if (highlightedIndex + 1 > matchingItems.length) {
      setHighlightedIndex(0)
    }
  };

  const handleKeyDown = (e: { keyCode: number; preventDefault: () => void; }) => {
    // Down Arrow - sets the next index in the 'dropDownList' as the highlighted index
    // `scrollIntoView` scrolls the dropdown to keep highlight visible once it reaches the bottom 
    // If the highlighted index is the last index it resets the highlighted index back to 0
    if (e.keyCode === 40 && matchingItems.length) {
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
    if (e.keyCode === 38) {
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

    // Enter key - Executes the `onSelect` function with 3 seperate arguments - 
    // the highlighted item's original `string` or `object`, it's `HTMLelement`, and it's index from the original list
    // If there is not a highlighted item it will pass the input's value into the 'onSelect' function
    // Then closes the dropdown and runs the `resetInputValue` function which uses `clearOnSelect` prop to clear the input or not
    if (e.keyCode === 13) {
      if (handleSubmit && !matchingItems.length) {
        updateSubmit(true)
        return
      }
      if (list && matchingItems[highlightedIndex]) {
        if (handleSelect) {
          try {
            handleSelect(
              list[matchingItems[highlightedIndex]!.originalIndex],
              itemsRef.current[highlightedIndex]
            )
          } catch (error) {
            console.error("You must provide a valid function to the 'onSelect' prop", '\n', error)
          }
        }
        setHighlightedIndex(highlightedIndex + 1)
        resetInputValue(matchingItems[highlightedIndex]!.value)
      } else {
        if (inputRef.current?.value) {
          let match = trie.current.contains(inputRef.current?.value);
          try {
            if (!match) {
              if (handleNewValue) {
                handleNewValue(inputRef.current.value.toString())
              } else {
                handleSelect(inputRef.current.value.toString())
              }
            } else {
              handleSelect(list[match.originalIndex])
            }
          } catch (error) {
            console.error("MISSING PROP: You must provide a valid function to the 'onSelect' prop", '\n', error)
          } finally {
            setMatchingItems([]);
            resetInputValue(inputRef.current.value)
          }
        }
      }
    }
    // Tab key takes focus off the input and closes the dropdown 
    if (e.keyCode === 9) {
      setMatchingItems([]);
      handleUpdateIsOpen(false)
    }
  }

  // When an item is clicked on - Executes the `onSelect` function with 3 seperate arguments - 
  // the highlighted item's original `string` or `object`, it's `HTMLelement`, and it's index from the original list
  // If there is not a highlighted item it will pass the input's value into the 'onSelect' function
  // Then closes the dropdown and runs the `resetInputValue` function which uses `clearOnSelect` prop to clear the input or not
  const onMouseClick = (index: number, selectedElement: HTMLDivElement, matchingItem: string) => {
    if (handleSelect) {
      try {
        handleSelect(list[index], selectedElement)
      } catch (error) {
        console.error("You must provide a valid function to the 'onSelect' prop", '\n', error)
      }
    }
    setMatchingItems([]);
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

  
  console.log(itemsRef.current)
  const dropDownList = sorted.map((matchingItem: MatchingItemsProps, index: number) => {
    if (highlightedIndex + 1 > matchingItems.length) {
      setHighlightedIndex(0)
    }
    itemsRef.current = []
    return (
      matchingItem.value !== undefined && itemsRef.current[index] !== null ?
        <div
          key={matchingItem.originalIndex}
          ref={el => itemsRef.current[index] = el!}
          className={highlightedIndex === index ? "dropdown-item highlited-item" : "dropdown-item"}
          style={highlightedIndex === index ? { ...highlightedItemStyle, ...listItemStyle } : { ...listItemStyle }}
          onClick={() => onMouseClick(matchingItem.originalIndex, itemsRef.current[index]!, matchingItem.value)}
          onMouseEnter={() => setHighlightedIndex(index) }
        >
          {matchingItem.value}
        </div>
        // : itemsRef.current.slice(0, index).concat(itemsRef.current.slice(index+1))
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
          setMatchingItems([]);
        }
        handleUpdateIsOpen(false)
      }}>
      <input
        className="autocomplete-input"
        style={inputStyle}
        ref={inputRef}
        type="search"
        {...inputProps}
        onClick={() => handlePrefix}
        onChange={handlePrefix}
        onKeyDown={handleKeyDown}
        onFocus={handlePrefix}
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
  // When handleSelect runs it will clear the input if 'clearOnSelect' is set to true
  // If clearOnSelect is set to false it will set the input value to the word passed in
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
          setMatchingItems([]);
        }
      }
    }
    handleUpdateIsOpen(false)
  }

  // Sets the value of the input to be what is specified in 'clearOnSubmit' prop
  // When handleSelect runs it will clear the input if 'clearOnSubmit' is set to true
  // If clearOnSubmit is set to false it will set the input value to the word passed in
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
          setMatchingItems([]);
        }
      }
    }
  }

  // Passes the state of `isOpen` back to parent when dropdown is open -
  // or closed from the Autocomplete function ("the child")
  function handleUpdateIsOpen(isItOpen: boolean) {
    if (updateIsOpen) {
      updateIsOpen(isItOpen)
    }
  }
}