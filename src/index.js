import React from 'react';
import ReactDOM from 'react-dom';
import Calendar from "./components/Calendar/Calendar";


const style = {
    position: 'relative',
    margin: '50px auto'

}

ReactDOM.render(
    <Calendar style={style} width="500px" />,
    document.getElementById('app')
);

module.hot.accept();