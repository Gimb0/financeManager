import React, { Component } from "react";
import axios from 'axios'
import Modal from './CustomModal'

export default class Expenses extends Component {
  	constructor(props) {
		super(props);
        
        this.state = {
            modal: false,
            activeItem: {
                id: 0,
                expense: "",
                amount: 0,
                expenseDate: null,
                category: ""
            },
            viewCategory: 0,
            expensesList: [],
            categoriesList: []
		};
	}
	  
	componentDidMount() {
		this.refreshList();
	}

	refreshList = () => {
		axios
			.get('/api/spendings/expenses/')
			.then(resp => {
				resp.data.sort(function(a, b) {
					var keyA = a.date;
					var keyB = b.date;

					return ((keyA < keyB) ?  -1 : ((keyB < keyA) ? 1 : 0));
				})
				this.setState({ expensesList: resp.data }) 
			})
			.catch(err => { console.log(err); })

		axios
			.get('/api/spendings/categories/')
			.then(resp => { 
				resp.data.sort(function(a, b) {
					var keyA = a.category;
					var keyB = b.category;

					return ((keyA < keyB) ?  -1 : ((keyB < keyA) ? 1 : 0));
				})
				resp.data.unshift({id: 0, category: "All"})
				this.setState({ categoriesList: resp.data })
			})
			.catch(err => { console.log(err); })
	}

	toggle = () => {
		this.setState({ modal: !this.state.modal });
	}

	handleSubmit = item => {
		this.toggle();
		if(item.id) {
			axios
				.put(`/api/spendings/expenses/${item.id}/`, item)
				.then(res => this.refreshList());
			return;
		}
		
		axios
			.post(`/api/spendings/expenses/`, item)
			.then(res => this.refreshList());
	}

	handleDelete = item => {
		axios
			.delete(`/api/spendings/expenses/${item.id}`, item)
			.then(res => this.refreshList());
	}

	createExpense = () => {
		const expense = { expense: "", amount: 0, category: ""};
		this.setState({ modal: !this.state.modal, activeItem: expense})
	}

	editExpense = expense => {
		this.setState({ modal: !this.state.modal, activeItem: expense })
	}

	displayCategory = category => {
		return this.setState({ viewCategory: category });
	}

	renderTabList = () => {
		const categoryItems = this.state.categoriesList
		return categoryItems.map(item => (
			<span key={item.id}
				onClick={() => this.displayCategory(item.id)}
				className={ item.id === this.state.viewCategory ? "active" : "" }
			> 
				{item.category}
			</span>
		));
	};
	  
	renderItems = () => {
		var expenseItems = this.state.expensesList
		if (this.state.viewCategory > 0) {
			expenseItems = this.state.expensesList.filter(
				item => item.category === this.state.viewCategory
			);
		}

		return expenseItems.map(item => (
			<li
				key={item.expense}
				className="list-group-item d-flex justify-content-between align-items-center"
			>
				<span>Expense: {item.expense}</span>
				<span>Cost: ${item.amount}</span>
				<span>Date: {item.date}</span>
				<span>
					<button onClick={() => this.editExpense(item)} className="btn btn-secondary mr-2"> Edit </button>
					<button onClick={() => this.handleDelete(item)} className="btn btn-danger">Delete </button>
				</span>
			</li>
		));
	};
  
	render() {
		return (
			<main className="content">
				<h1 className="text-white text-uppercase text-center my-4">Finance Site - Expenses</h1>
				<div className="row ">
				<div className="col-md-6 col-sm-10 mx-auto p-0">
					<div className="card p-3">
					<div>
						<button onClick={this.createExpense} className="btn btn-primary">Add Expense</button>
					</div>
					<div className='my-5 tab-list'>
						{this.renderTabList()}
					</div>
					<ul className="list-group list-group-flush">
						{this.renderItems()}
					</ul>
					</div>
				</div>
				</div>
				{this.state.modal ? (
					<Modal
						activeItem={this.state.activeItem}
						categories={this.state.categoriesList}
						toggle={this.toggle}
						onSave={this.handleSubmit}
					/>
				) : null}
			</main>
		);
  	}
}