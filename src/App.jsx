import { useState } from 'react';
import AutoComplete from './AutoComplete';
import testData from './test-data.json'
import "./index.css"

function App() {
  const [submit, setSubmit] = useState(false);
  const [openDropDown, setOpenDropDown] = useState();
  const [filter, setFilter] = useState(true);
  const [sort, setSort] = useState(false);
  const toggleDropDown = (() => {
    setOpenDropDown(openDropDown ? false : true)
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

  const [newList, setNewList] = useState(testData);
  let a = [0, 33, 1, 55, 5, 111, 11, 333, 44]

  const logMessage = (message) => {
    return (message.map((listItem) => listItem.id));
  };

  return (
    <div className="App">
      {/* {preview.name ? preview.name : ""} */}
      <button className='ignore btn' style={{ padding: '10px' }} onClick={toggleDropDown}>OPEN/CLOSE</button>
      <button className='ignore btn' style={{ padding: '10px' }} onClick={toggleFilter}>FILTER</button>
      <button className='ignore btn' style={{ padding: '10px' }} onClick={toggleSort}>SORT</button>
      <button className='ignore btn' style={{ padding: '10px' }} onClick={toggleSubmit}>SUBMIT</button>
      <button className='ignore btn' style={{ padding: '10px' }} onClick={toggleList}>LIST</button>

      <AutoComplete
        test={logMessage}
        //list={[0, 33, 1, 55, 5, 111, 11, 333, 44]}
        list={newList}
        //list={newList ? testData : a}
        //list={testData}

        getPropValue={
          filter === false ?
            (y) => {
              var vals = [];
              for (var i = 0; i < y.length; i++) {
                vals.push(y[i].name);
              }
              return vals
            }
            :
            (y) => {
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
          setNewList(oldList => [...oldList, {name:value}])
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
        //clearOnSubmit={false}
        updateSubmit={setSubmit}

        //disableOutsideClick={true}
        updateIsOpen={(updatedState) => {
          setOpenDropDown(updatedState)
        }}
        isOpen={openDropDown}
      />

    </div>
  );
}

export default App;
