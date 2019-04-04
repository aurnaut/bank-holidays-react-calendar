import React, { Component } from 'react';
import moment from 'moment';
import './Calendar.css';
import "@babel/polyfill";

class Calendar extends Component {

    state = {
        dateContext: moment(),
        today: moment(),
        showMonthPopup: false,
        showYearPopup: false,
        bankHolidays: {}
    }

    constructor(props) {
        super(props);
        this.width = props.width || "350px";
        this.style = props.style || {};
        this.style.width = this.width;
    }

    BANK_HOLIDAYS_API = 'https://www.gov.uk/bank-holidays.json';
    weekdays = moment.weekdays();
    weekdaysShort = moment.localeData('en-gb').weekdaysShort(true);
    months = moment.months();

    year = () => {
        return this.state.dateContext.format('Y');
    }

    month = () => {
        return this.state.dateContext.format('MMMM');
    }

    daysInMonth = () => {
        return this.state.dateContext.daysInMonth();
    }

    currentDate = () => {
        return this.state.dateContext.get('date');
    }

    currentDay = () => {
        return this.state.dateContext.format('D');
    }

    currentMonth = () => {
        return this.state.dateContext.format('MM');
    }

    currentYear = () => {
        return this.state.dateContext.format('YYYY');
    }

    firstDayOfMonth = () => {
        let dateContext = this.state.dateContext;
        let firstDay = moment(dateContext).startOf('month').format('d');
        return firstDay;
    }

    setMonth = (month) => {
        let monthNo = this.months.indexOf(month);
        let dateContext = Object.assign({}, this.state.dateContext);
        dateContext = moment(dateContext).set('month', monthNo);
        this.setState({
            dateContext: dateContext
        })
    }

    nextMonth = () => {
        let dateContext = Object.assign({}, this.state.dateContext);
        dateContext = moment(dateContext).add(1, 'month');
        this.setState({
            dateContext: dateContext
        });
        this.props.onNextMonth && this.props.onNextMonth();
    }

    prevMonth = () => {
        let dateContext = Object.assign({}, this.state.dateContext);
        dateContext = moment(dateContext).subtract(1, 'month');
        this.setState({
            dateContext: dateContext
        });
        this.props.onPrevMonth && this.props.onPrevMonth();
    }

    onSelectChange = (e, data) => {
        this.setMonth(data);
        this.props.onMonthChange && this.props.onMonthChange();
    }

    SelectList = (props) => {
        let popup = props.data.map((data) => {
            return (
                <div key={data}>
                    <a href='#' onClick={(e) => { this.onSelectChange(e, data) }}>
                        {data}
                    </a>
                </div>
            )
        });

        return (
            <div className="month-popup">
                {popup}
            </div>
        );
    }

    onChangeMonth = (e, month) => {
        this.setState({
            showMonthPopup: !this.state.showMonthPopup
        })
    }

    MonthNav = () => {
        return (
            <span className="label-month" onClick={(e) => { this.onChangeMonth(e, this.month()) }}>
                {this.month()}
                {this.state.showMonthPopup &&
                    <this.SelectList data={this.months} />
                }
            </span>
        );
    }

    showYearEditor = () => {
        this.setState({
            showYearNav: true
        })
    }

    setYear = (year) => {
        let dateContext = Object.assign({}, this.setState.dateContext);
        dateContext = moment(dateContext).set('year', year);
        this.setState({
            dateContext: dateContext
        })
    }

    onYearChange = (e) => {
        this.setYear(e.target.value);
        this.props.onYearChange && this.props.onYearChange(e, e.target.vale);
    }

    onKeyUpYear = (e) => {
        if (e.which === 13 || e.which === 27) {
            this.setYear(e.target.value);
            this.setState({
                showYearNav: false
            })
        }
    }

    YearNav = () => {
        return (
            this.state.showYearNav
                ?
                <input
                    defaultValue={this.year()}
                    className='editor-year'
                    ref={(yearInput) => { this.yearInput = yearInput }}
                    onKeyUp={(e) => this.onKeyUpYear(e)}
                    onChange={(e) => this.onYearChange(e)}
                    type='number'
                    placeholder='year' />
                :
                <span className='label-year' onDoubleClick={(e) => { this.showYearEditor() }}>
                    {this.year()}
                </span>
        );
    }



    componentDidMount = async () => {
        await this.getBankHols()
    }

    getBankHols = async () => {
        const response = await fetch(this.BANK_HOLIDAYS_API);
        const data = await response.json();
        this.setState({
            bankHolidays: data['england-and-wales'].events
        })
    }

    render() {
        let weekdays = this.weekdaysShort.map((day) => {
            return (
                <td key={day} className='week-day'>{day}</td>
            )
        });

        let blankDays = [];

        for (let i = 1; i < this.firstDayOfMonth(); i++) {
            blankDays.push(<td key={i * 80} className="empty-slots">{''}</td>)
        }

        let daysInMonth = [];
        for (let d = 1; d <= this.daysInMonth(); d++) {
            let className = (d == this.currentDay() && this.state.dateContext.format('MM') == this.state.today.format('MM') && this.state.dateContext.format('YYYY') == this.state.today.format('YYYY') ? 'day current-day' : 'day');
            daysInMonth.push(
                <td key={d} className={className}>
                    <span>{d}</span>
                </td>
            )
        }

        var totalSlots = [...blankDays, ...daysInMonth];
        let rows = [];
        let cells = [];

        totalSlots.forEach((row, i) => {
            if ((i % 7) !== 0) {
                cells.push(row);
            } else {
                let insertRow = cells.slice();
                rows.push(insertRow);
                cells = [];
                cells.push(row);
            }

            if (i === totalSlots.length - 1) {
                let insertRow = cells.slice();
                rows.push(insertRow);
            }
        });

        let loopBankHols = Object.entries(this.state.bankHolidays).map((val, i) => {
            if (this.state.dateContext.year() + '-' + this.state.dateContext.format('MM') == (val[1].date).slice(0, -3)) {
                return (
                    <tr key={i * 70}>
                        <td colSpan="7">{moment(val[1].date).format('dddd, MMMM Do YYYY') + ' - ' + val[1].title}</td>
                    </tr>
                )
            }
        })



        let trElements = rows.map((d, i) => {
            return (
                <tr key={i * 100}>
                    {d}
                </tr>
            )
        })

        return (
            <div className="calendar-container" style={this.style}>
                <table className="calendar">
                    <thead>
                        <tr className="calendar-header">
                            <td colSpan='5'>
                                <this.MonthNav />
                                {' '}
                                <this.YearNav />
                            </td>
                            <td colSpan='2' className='nav-month'>
                                <i className='prev fa fa-fw fa-chevron-left'
                                    onClick={(e) => { this.prevMonth() }}></i>
                                <i className='next fa fa-fw fa-chevron-right'
                                    onClick={(e) => { this.nextMonth() }}></i>
                            </td>
                        </tr>
                    </thead>
                    <tbody>
                        <tr>
                            {weekdays}
                        </tr>
                        {trElements}
                        {loopBankHols}

                    </tbody>
                </table>
            </div>
        );
    }
}



export default Calendar;