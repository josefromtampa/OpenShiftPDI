if ('function' === typeof importScripts) {
	var worker = self

	self.importScripts('lodash.worker.js')
	self.addEventListener('message', onMessage, false)

	function onMessage(event) {
		try {
			message = JSON.parse(event.data)
			switch (message.type) {
				case "getItAll":
					getItAll(message)
					break;
			}

		} catch (err) {
			console.error('err::', err)
		}
	}

	function getItAll(message) {
		var sourceSections = _.clone(message.data.form.sections),
			cardDependencyList = _data.flattenUserFormSections(message.data),
			menu = [],
			sections = {}

		_.each(sourceSections, function (section) {
			var filteredCards = cardDependencyFilter(section.cards, cardDependencyList)
			if (filteredCards.length) {
				menu.push({
					type: "section",
					id: section.id,
					title: section.title
				})
				sections[section.id] = true
			}
			_.each(filteredCards, function (card) {
				menu.push({
					type: "card",
					id: card.id,
					title: card.title
				})
			})
		})

		respond(message.type, {
			sections: sections,
			menu: menu
		})
	}

	function respond(type, data) {
		self.postMessage(JSON.stringify({
			type: type,
			data: data
		}))
	}

	function cardDependencyFilter(cards, answers) {

		try {
			var card = null;
			var filtered = [];
			var passed = true;

			if (cards) {
				for (var i = cards.length; i--;) {

					card = cards[i];
					passed = true;

					if (card) {

						// evaluate if card has dependencies
						if (card.dependencies && card.dependencies.length > 0) {
							// eval card
							passed = _evaluator.evalDependency(card, answers);
						}// if

						// evaluate if card eval passed and section has dependencies
						if (passed && card.section && card.section.dependencies && card.section.dependencies.length > 0) {

							// eval section
							passed = _evaluator.evalDependency(card.section, answers);

						}// if

					}// if

					if (passed) {
						filtered.unshift(cards[i]);
					} // if

				}// for
			}// if

			return filtered;

		} catch (e) {

			console.error(e);

			return cards;
		}// try-catch
	};

	var _comparer = {

		eq: function (value, dependencyVal) {
			return value == dependencyVal;
		},

		option_eq: function (option, dependencyOption) {
			return option && dependencyOption && option.value == dependencyOption.value;
		},

		option_neq: function (option, dependencyOption) {

			return option && dependencyOption && option.value != dependencyOption.value;
		},

		neq: function (value, dependencyVal) {
			return value != dependencyVal;
		},

		gt: function (value, dependencyVal) {
			return value > dependencyVal;
		},

		gte: function (value, dependencyVal) {
			return value >= dependencyVal;
		},

		lt: function (value, dependencyVal) {
			return value < dependencyVal;
		},

		lte: function (value, dependencyVal) {
			return value <= dependencyVal;
		},

		range: function (value, dependencyValue) {

			var min = dependencyValue.length > 0 ? dependencyValue[0] : null;
			var max = dependencyValue.length > 1 ? dependencyValue[1] : null;

			if (min != undefined && min != null && max != undefined && max != nul) {
				// full range present
				return value >= dependencyValMin && value <= dependencyValMax;

			} else if (min != undefined && min != null) {
				// only min
				return value >= min;

			} else if (max != undefined && max != null) {
				// only max
				return value <= max;

			} else {
				// no range
				return true;
			}
		}

	};

	// form validators
	var _validator = {

		required: function (value) {
			return value != undefined && value != null && value != '';
		},

		eq: function (value, compareValue) {

			try {
				return value == compareValue;
			} catch (e) {
			}

			return false;
		},

		lt: function (value, compareValue) {

			try {
				return parseFloat(value) < parseFloat(compareValue);
			} catch (e) {

			}

			return false;
		},

		lte: function (value, compareValue) {
			try {
				return parseFloat(value) <= parseFloat(compareValue);
			} catch (e) {

			}

			return false;
		},

		gt: function (value, compareValue) {
			try {
				return parseFloat(value) > parseFloat(compareValue);
			} catch (e) {

			}

			return false;
		},

		gte: function (value, compareValue) {
			try {
				return parseFloat(value) >= parseFloat(compareValue);
			} catch (e) {

			}

			return false;
		}

	};

	// form evaluators
	var _evaluator = {

		compareDependency: function (question, dependency) {

			try {

				if (question && dependency.value != null) {

					// get comparer
					var comparer = _comparer[dependency.operator];

					if (comparer) {
						// execute comparer
						return comparer(question.answer, dependency.value);

					}

				}
			} catch (e) {
				console.error(e);
			}

			// pass if question not provided
			return true;

		},

		evalDependency: function (object, answers) {

			try {

				if (object && object.dependencies && object.dependencies.length > 0
					&& answers) {

					var pass = true;
					var curDependency = null;
					var curAnswer = null;

					// evaluate dependency
					for (var i = object.dependencies.length; i--;) {

						curDependency = object.dependencies[i];

						if (curDependency.questionId) {

							// find dependent answer
							curAnswer = answers[curDependency.questionId];

							pass = _evaluator.compareDependency(curAnswer, curDependency);

							// exit if at least one dependency fails
							if (!pass) {
								break;
							}

						}

					}

					return pass;

				}

			} catch (e) {

				console.error(e);

			}

			// return true for error or invalid dependency
			return true;
		},

		evalValidators: function (value, validators, cHashTable, qHashTable) {

			if (validators) {

				var curValidator = null;
				var validator = null;
				var compareObj = null;
				var compareValue = null;

				var curValue = _data.getValue(value);

				for (var i = validators.length; i--;) {
					curValidator = validators[i];

					// get validator
					validator = _validator[curValidator.operator];

					if (validator) {

						// get validator comparison value
						compareObj = _data.evaluateValidationComparison(curValidator.comparison, cHashTable, qHashTable);
						compareValue = _data.getValue(compareObj);

						// apply aggregate if set
						if (curValidator.aggregate) {
							compareValue = _data.evalAggregate(curValidator.aggregate, compareValue);
							curValue = _data.evalAggregate(curValidator.aggregate, curValue);
						}

						// execute validator
						valid = validator(curValue, compareValue);
					}

					// return if at least one validation fails
					if (!valid) {
						return {valid: false, message: curValidator.invalidMessage};
					}

				}
			}

			return {valid: true, message: null};
		},

		validateQuestion: function (question, cHashTable, qHashTable) {

			try {

				if (question && question.validators && question.validators.length > 0) {

					// validate question
					return _evaluator.evalValidators(question.answer, question.validators, cHashTable, qHashTable);

				}

			} catch (e) {
				console.error(e);
			}

			// no validators - return true
			return {valid: true, message: null};
		},

		validateCard: function (card, cardsList) {

			try {

				if (card && card.questions && card.questions.length > 0) {

					var results = null;
					var cHashTable = _data.flattenCards(cardsList);
					var qHashTable = _data.flattenQuestions(cardsList);

					// iterate through questions and validate
					for (var i = 0; i < card.questions.length; i++) {

						// check question validation
						results = _evaluator.validateQuestion(card.questions[i], cHashTable, qHashTable);

						// return false if any is invalid
						if (!results.valid) {
							return results;
						}
					}

					// validate at whole card level
					if (card.validators && card.validators.length > 0) {
						return _evaluator.evalValidators(card, card.validators, cHashTable, qHashTable);
					}

				}

			} catch (e) {
				console.error(e);
			}

			return {valid: true, message: null};

		}
	};

	// form object data manipulations
	var _data = {

		getId: function (object) {

			if (object) {

				return object.id || object._id;
			}

			return null;
		},

		typeOf: function (object) {

			if (object) {
				// is card?
				if (object.questions) {
					return 'card';
				}//

				// is question?
				if (object.answer) {

					if (object.answer.value) {
						return 'question_options'
					}

					return 'question';
				}

				if (object.value) {
					return 'key_value';
				}

			}

			// return actual
			return 'literal';
		},

		getValue: function (object) {

			if (object) {
				var compareType = _data.typeOf(object);

				// parse value
				switch (compareType) {

					case 'card':
						return _.pluck(object.questions, 'answer');

					case 'question_options':
						return object.answer.value;

					case 'question':
						return object.answer;

					case 'key_value':
						return object.value;

				}
			}

			return object;

		},

		evalAggregate: function (aggregate, object) {

			try {
				switch (aggregate) {

					case 'sum':

						if (Array.isArray(object)) {

							var sum = 0;
							var cur = 0;

							for (var i = object.length; i--;) {
								cur = parseFloat(_data.getValue(object[i]));

								if (!isNaN(cur)) {
									sum += cur;
								}
							}

							return sum;
						}

						break;

					case 'concat':

						if (Array.isArray(object)) {

							var str = '';

							for (var j = 0; j < object.length; j++) {
								str += _data.getValue(object[j]);
							}

							return str;
						}

						break;

					case 'bool_or':

						if (Array.isArray(object)) {

							var result = false;

							for (var k = object.length; k--;) {
								result = result || _data.getValue(object[k]);
							}

							return result;
						}

						break;

					case 'bool_and':

						if (Array.isArray(object)) {

							var result = true;

							for (var k = object.length; k--;) {
								result = result && _data.getValue(object[k]);
							}

							return result;
						}
						break;

				}
			} catch (e) {

			}

			return object;

		},

		pluckQuestions: function (cards) {

			return _.flatten(_.pluck(cards, 'questions'));
		},

		flattenUserFormSections: function (userForm) {
			userForm.form.cards = []
			for (var i = 0; i < userForm.form.sections.length; i++) {
				section = userForm.form.sections[i]
				userForm.form.cards = userForm.form.cards.concat(section.cards)
			}

			delete userForm.form.sections
			return _data.flattenUserFormQuestions(userForm)
		},

		// flatten all questions into an hash table lookup object
		flattenUserFormQuestions: function (userForm, filter) {

			try {

				if (userForm && userForm.form && userForm.form.cards && userForm.form.cards.length > 0) {

					return _data.flattenQuestions(userForm.form.cards, filter);

				}

				return {};

			} catch (e) {

				console.error(e);
				return null;
			}

		},

		// flatten all cards into a hash table lookup
		flattenCards: function (cards) {

			var hashtable = {};
			var cur = null;

			for (var i = cards.length; i--;) {
				cur = cards[i];

				hashtable[cur.id] = cur;
			}

			return hashtable;
		},

		flattenQuestions: function (cards, filter) {

			var hashtable = {};
			var curQ = null;

			// iterate through cards
			var questions = _data.pluckQuestions(cards);

			// iterate through questions
			for (var j = questions.length; j--;) {
				curQ = questions[j];

				if (!filter || filter(curQ)) {
					hashtable[_data.getId(curQ)] = curQ;
				}
			}

			return hashtable;

		},

		filterOutline: function (outline, progressCards) {

			var filtered = [];

			var sections = outline.sections;

			if (sections && progressCards) {

				// get unique list of valid sections
				var validSections = _.uniq(_.map(progressCards, function (card) {
					return card.section.id;
				}));

				var curSection = null;
				var curCard = null;
				var idx = -1;

				for (var i = sections.length; i--;) {

					// process if valid section
					if (_.indexOf(validSections, sections[i].id) > -1) {

						// add to filter
						//curSection = angular.copy(sections[i]);
						curSection = sections[i];
						curSection.cards = [];

						for (var j = sections[i].cards.length; j--;) {

							idx = -1;
							// find matching card in progress
							curCard = _.find(progressCards, function (card) {
								idx++;
								return card.id == sections[i].cards[j].id;
							});

							if (curCard) {
								// add card if valid
								curCard.index = idx;
								curSection.cards.unshift(curCard);
							}

						}
						// add section to filter
						filtered.unshift(curSection);

					}

				}
			}

			return filtered;
		},

		evaluateValidationExpression: function (expression, cHashTable, qHashTable) {

			var resultsVal = 0;

			if (expression && expression.value && Array.isArray(expression.value) && expression.value.length > 0) {

				try {

					var curExp = null;
					var curObj = null;
					var curValue = null;
					var tempVal = null;

					for (var i = 0, len = expression.value.length; i < len; i++) {

						curExp = expression.value[i];
						curObj = _data.evaluateValidationComparison(curExp, cHashTable, qHashTable);
						curVal = _data.evalAggregate('sum', _data.getValue(curObj));

						switch (curExp.operator) {

							case '-':
								// add
								tempVal = parseFloat(curVal);

								if (!isNaN(tempVal)) {
									resultsVal -= tempVal;
								}
								break;

							case '/':
								// add
								tempVal = parseFloat(curVal);

								if (!isNaN(tempVal)) {
									resultsVal /= tempVal;
								}
								break;

							case '*':
								// add
								tempVal = parseFloat(curVal);

								if (!isNaN(tempVal)) {
									resultsVal *= tempVal;
								}
								break;

							case '+':

								// add
								tempVal = parseFloat(curVal);

								if (!isNaN(tempVal)) {
									resultsVal += tempVal;
								}

								break;

						}
						;

					}

				} catch (e) {
				}

			}

			return resultsVal;
		},

		// evaluates comparison validator and returns the object to validate with
		evaluateValidationComparison: function (comparison, cHashTable, qHashTable) {

			if (comparison) {

				switch (comparison.type) {
					case 'card':
						// find card
						return cHashTable[comparison.value];

					case 'question':
						// find question and return value
						var question = qHashTable[comparison.value];

						if (question) {
							return question.answer;

						}

						return null;
					case 'expression':

						return _data.evaluateValidationExpression(comparison, cHashTable, qHashTable);

					default:
						// static value comparison
						return comparison.value;
				}
				;

			}

			return null;
		}
	};
}