import { useState } from 'react';
import AutoComplete from './AutoComplete';
import testData from './test-data.json'
import "./index.css"

function App() {
  const [submit, setSubmit] = useState(false);
  const [openDropDown, setOpenDropDown] = useState<boolean>();
  const [filter, setFilter] = useState(true);
  const [sort, setSort] = useState(false);
  const [newList, setNewList] = useState<(object | number)[]>(testData);
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

  const x = [{
    "id": "488f3c2a-8140-4b08-abd0-f600b5f2b85a"
  },
  {
    "id": "4fc4e79c-5f83-4560-aa15-ce289e59177b"
  },
  {
    "id": "2e59d604-a42a-422a-a722-0b775f44d27c"
  },
  {
    "name": "4fc4e"
  },
  {
    "name": "2e59d"
  },
  {
    "id": "488f3",
    "name": "John Doe",
    "age": 28
  }]
  let a = [0, 33, 1, 55, 5, 111, 11, 333, 44]

  return (
    <div className="App">
      {/* {preview.name ? preview.name : ""} */}
      <button className='ignore btn' style={{ padding: '10px' }} onClick={toggleDropDown}>OPEN/CLOSE</button>
      <button className='ignore btn' style={{ padding: '10px' }} onClick={toggleFilter}>FILTER</button>
      <button className='ignore btn' style={{ padding: '10px' }} onClick={toggleSort}>SORT</button>
      <button className='ignore btn' style={{ padding: '10px' }} onClick={toggleSubmit}>SUBMIT</button>
      <button className='ignore btn' style={{ padding: '10px' }} onClick={toggleList}>LIST</button>

      <AutoComplete
        //list={[0, 33, 1, 55, 5, 111, 11, 333, 44]}
        //list={newList}
        list={newList}
        //list={testData}

        getPropValue={
          filter === false ?
            (y : any[]) => {
              var vals = [];
              for (var i = 0; i < y.length; i++) {
                vals.push(y[i]?.name);
              }
              return vals
            }
            :
            (y : any[]) => {
              var vals = [];
              for (var i = 0; i < y.length; i++) {
                vals.push(y[i].id);
              }
              return vals
            }
        }
        //getPropValue={logMessage}
        // handleHighlight={(item) => {
        //   console.log(item)
        // }}
        handleSelect={(item, element) => {
          console.log("handleSelect")
          console.log(element)
          console.log(item)
        }}
        handleNewValue={(value) => {
          console.log("HANDLE NEW VALUE")
          setNewList(newList => [...newList, {name:value}])
        }}
        handleSubmit={(selectedItem) => {
          console.log("HANDLE SUBMIT")
          console.log(selectedItem)
        }}
        showAll={true}
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

        //disableOutsideClick={true}
        updateIsOpen={setOpenDropDown}
        isOpen={openDropDown}
      />
    </div>
  );
}

export default App;
