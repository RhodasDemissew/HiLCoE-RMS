import React, { useState } from 'react'

function InputField() {
    const [ inputValue, setInputValue ] = useState('')

    const handleChange = (event) => {
        setInputValue(event.target.value);
    };

    return (
        <div>
            <label htmlFor="input" className=''>Find a Reasearch...</label>
            <input 
                type="text"
                id='input'
                name='input'
                value={inputValue}
                onChange={handleChange}
                className=''
                
            />
        </div>
    )
}

export default InputField