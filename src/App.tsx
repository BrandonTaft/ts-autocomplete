import { useState } from 'react';
import AutoComplete from './AutoComplete';
import testData from './test-data.json'
import "./index.css"

function App() {
  const [submit, setSubmit] = useState(false);
  const [openDropDown, setOpenDropDown] = useState<boolean>();
  const [filter, setFilter] = useState(true);
  const [sort, setSort] = useState(false);
  const [newList, setNewList] = useState<(getProps | number)[]>(testData);
  let a = [0, 33, 1, 55, 5, 111, 11, 333, 44]

  const toggleDropDown = (() => {
    setOpenDropDown(!openDropDown)
  })
  const toggleFilter = (() => {
    setFilter(filter => !filter)
  })
  const toggleSort = (() => {
    setSort(sort => !sort)
  })
  const toggleSubmit = (() => {
    setSubmit(true)
  })
  const toggleList = (() => {
    setNewList(newList === testData ? a : testData)
  })

  interface getProps {
    name?: string,
    age?: string | number,
    id?: string,
    nam?: string 
  }

  return (
    <div className="App">
      <button className='ignore btn' style={{ padding: '10px' }} onClick={toggleDropDown}>OPEN/CLOSE</button>
      <button className='ignore btn' style={{ padding: '10px' }} onClick={toggleFilter}>FILTER</button>
      <button className='ignore btn' style={{ padding: '10px' }} onClick={toggleSort}>SORT</button>
      <button className='ignore btn' style={{ padding: '10px' }} onClick={toggleSubmit}>SUBMIT</button>
      <button className='ignore btn' style={{ padding: '10px' }} onClick={toggleList}>LIST</button>

      <AutoComplete
        list={newList}
        getPropValue={
          filter === false ?
            (y: getProps[]) => {
             
              var vals = [];
              for (var i = 0; i < y.length; i++) {
                vals.push(y[i]?.name);
              }
              return vals
            }
            :
            (y: getProps[]) => {
              return y.map((listItem) => listItem.id)
            }
        }
       
        // handleHighlight={(item: number | getProps) => {
        //   console.log(item)
        // }}
        handleSelect={(item : number | getProps, element: HTMLDivElement) => {
          console.log("handleSelect")
          console.log(element)
          console.log(item)
        }}
        handleNewValue={(value) => {
          console.log("HANDLE NEW VALUE")
          return (
          setNewList(newList => [...newList, {name:value}])
          )
        }}
        handleSubmit={(selectedItem: any) => {
          console.log("HANDLE SUBMIT")
          console.log(selectedItem)
        }}
        //showAll={true}
        descending={sort}
        highlightFirstItem={false}
        inputProps={{
          placeholder: "search...",
        }}
        inputStyle={{
          width: "200px",
          padding: "5px"
        }}
        highlightedItemStyle={{
          backgroundColor: "dodgerBlue",
        }}
        wrapperStyle={{ width: 'fit-content' }}
        listItemStyle={{
          cursor: "pointer",
          padding: "5px"
        }}
        dropDownStyle={{
          backgroundColor: "antiquewhite",
          width: "215px",
          overflowY: "auto",
          maxHeight: "300px"
        }}


        clearOnSelect={false}


        submit={submit}
        updateSubmit={setSubmit}
        //showNoMatchMessage={"Fuck You"}
        //disableOutsideClick={true}
        updateIsOpen={setOpenDropDown}
        isOpen={openDropDown}
      />
    </div>
  );
}

export default App;
