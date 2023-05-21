
# React Autocomplete Input Component

```jsx
  import { AutoComplete } from 'react-autocomplete-input-component';

  <AutoComplete
    list={[
      { firstName: 'Tom', lastName: 'Tomson' },
      { firstName: 'Tommi', lastName: 'Tomison' },
      { firstName: 'Thomas', lastName: 'Thomason' }
    ]}
    getPropValue={(list) => {
      list.map((listItem) => listItem.id)
    }}
    handleHighlightedItem={(highlightedItem) => {
      console.log(highlightedItem)
    }}
    handleSelect={(selectedItem, selectedElement) => {
      console.log(selectedItem)
    }}
    handleNewValue={(value) => {
      setNewList(oldList => [...oldList, {name:value}])
    }}
    inputProps={{
      placeholder: "search..."
    }}
  />
```

## Demo
[Check out more examples](https://brandontaft.github.io/autocomplete-demo)

## Install
### npm

```bash
npm install --save react-autocomplete-input-component
```

## Props

### `list: []`
- `Array` of the values to be searched for a match to the user input
- List values that match the user's input will be displayed in the dropdown
- `getPropValue: Function` is needed if `list` array contains objects 

### `getPropValue: Function` (Optional)
- Function that is only needed if `list` contains objects, and should return an       array of values to be displayed
- It's only argument is the list array `(list: []) => {}`
- Used to Set the object property value to be extracted and displayed in dropdown

### `handleHighlight: Function` (Optional)
- Function that runs when the `highlighted item` changes
- The only argument is the item or object from the original list prop 

### `handleSelect: Function`
- Function that will run when an item is selected from the dropdown, or if there is not a matching item and a `handleNewValue` function is not passed in
- If `handleNewValue` is passed in, it will always run if the input value is not in the `list`
- The 1st argument is the value or object from the original `list` prop 
- The 2nd argument is the `selected item` passed in as an `***HTMLDivElement***`, but only if it is highlighted
- If there is not a matching item, the text input value is passed in
- If the selected item is a number it will be returned as a `string`

### `handleNewValue: Function` (Optional)
- Runs when there is no matching value for the text input
- If it is not passed in, the `onSelect` function will run
- The input value is its only Argument

### `inputProps: Object` (Optional)
- Sets HTML text input attributes with some exceptions
- Type and Autocomplete are unable to be overridden
- Some Event handlers can be used
- onClick, onChange, onKeyDown, onFocus cannot be overridden

### `isOpen : Boolean` (Optional)
- This prop is used to control the position of the dropdown
- Can be used to add to the default logic or override it by setting `disableOutsideClick` to `true`
- Use with `updateIsOpen` to completely control the dropdown

### `updateIsOpen: Function` (Optional)
- Function used to update the parent with the current position of the dropdown
- Runs any time the dropdown is opened or closed

```jsx
  const [openDropDown, setOpenDropDown] = useState()

  const toggleDropDown = () => {
    setOpenDropDown(openDropDown ? false : true)
  }

  return(
    <>
      <button className='ignore' onClick={toggleDropDown} />
      <AutoComplete
        updateIsOpen={(updatedState) => {
          setOpenDropDown(updatedState)
        }}
        isOpen={openDropDown}
      />
    </>
  )
```
### `disableOutsideClick : Boolean` (Optional)
- `false` (default) the dropdown closes when mouse is clicked outside of the `auto-complete wrapper div`
- `true` the dropdown only closes when onSelect is invoked or the tab key is pressed
- `NOTE` to control the dropdown with `updateIsOpen` and keep this enabled,
  the element with the event handler should have a `className` of `ignore`

### `highlightFirstItem: Boolean` (Optional)
- `true` (default) - automatically highlights first item in dropdown
- `false` - Press arrow key or hover with mouse to highlight

### `showAll: Boolean` (Optional)
- `false` (default) dropdown doesn't appear until input value matches an item's prefix
- `true` - If the input is focused and empty the dropdown displays all list items

### `descending: Boolean` (Optional)
- `false` (default) values in dropdown will be in ascending order by default
- `true` - If set to `true` the values will be in descending order 

### `clearOnSelect: Boolean` (Optional)
- `true` (default) the input will clear when an item is selected
- `false` value selected will become the input value
- `onMouseDown` can be used in `inputProps` to clear the input

### `submit : Boolean` (Optional)
- Only used if you want to use the built-in `SUBMIT` button
- Each time it is updated to `true` the `handleSubmit` function runs
- Should be used with `updateSubmit` to update the state in the parent back to `false`

### `updateSubmit: Function` (Optional)
- Pass in the set function for your state used in the `submit` prop and it sets the state back to `false` after the `handleSubmit` function runs

### `handleSubmit: Function` (Optional)
- Function that runs when the `submit` prop is updated to `true`
- The omly argument is the original string or object of the value selected
- If there is not a matching item and `handleNewValue` is not passed in, only the text input value is passed in as an argument
- If `handleNewValue` is passed in, it will always run if the input value is not in the `list`

```jsx
  const [submit, setSubmit] = useState(false);

  const toggleSubmit = (() => {
    setSubmit(true)
  })

  return(
    <>
      <button className='ignore' onClick={toggleSubmit}>
        SUBMIT
      </button>
      <AutoComplete
        submit={submit}
        updateSubmit={setSubmit}
        handleSubmit={(selectedItem) => {
          console.log(selectedItem)
        }}
      />
    </>
  )
```

### `wrapperStyle: Object` (Optional)
- J.S. Style Object Variable for the `div` wrapping the whole component
- CSS can also be used with the class name `autocomplete-wrapper`

### `inputStyle: Object` (Optional)
- J.S. Style Object Variable for the `input` element
- CSS can also be used with the class name `autocomplete-input`

### `dropDownStyle: Object` (Optional)
- J.S. Style Object Variable for the dropdown container `div`
- CSS can also be used with the class name `dropdown-container`

### `listItemStyle: Object` (Optional)
- J.S. Style Object Variable for each `item div` in the dropdown
- CSS can also be used with the class name `dropdown-item`

### `highlightedItemStyle: Object` (Optional)
- J.S. Style Object Variable for the `highlighted item`
- CSS can also be used with the class name `highlighted-item`
- Default color is `dodgerBlue`

```jsx  
  <AutoComplete
    highlightedItemStyle={{
      backgroundColor: "dodgerBlue"
    }}
    listItemStyle={{
      cursor: "pointer",
      padding: "5px"
    }}
  />
```