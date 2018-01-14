;
(function (window, angular) {

	angular.module("ibhs", [
		"ngAria",
		"ngMaterial",

		"ui.router",
		"restangular",
		"720kb.datepicker",

		"laicos.datacollector.controls",

		"laicos.ui.scroll",
		"laicos.ui.popsauce",
		"laicos.ui.util",
		"laicos.ui.filter.slugify",

		"ibhs.template",
		"ibhs.login",
		"ibhs.nav",
		"ibhs.user",
		"ibhs.form"
	])

		.config([
			"$urlRouterProvider",
			"RestangularProvider",
			"localStorageServiceProvider",
			"$compileProvider",
			"$stateProvider",
			function ($urlRouterProvider,
								RestangularProvider,
								localStorageServiceProvider,
								$compileProvider,
								$stateProvider) {

				localStorageServiceProvider
					.setPrefix('ibhs')

				$compileProvider.aHrefSanitizationWhitelist(/^\s*(https?|local|data):/)

				RestangularProvider
					//.setRestangularFields({
					//	id: "_id"
					//})
					.setDefaultHttpFields({cache: false})
					.setBaseUrl(window.IBHS_ADMIN_URL || "/")

				$urlRouterProvider.otherwise("/")
			}
		])

		.service("ibhs.Query", [
			"$state",
			"$stateParams",
			function ($state, $stateParams) {
				var Query = function (value) {
					if ($stateParams.query) {
						value = parseUrlValue()
					}
					var query = {
						value: applyDefaults(value),
						sort: function (key) {
							query.value.page = 1
							if (query.value.sort.by == key) {
								query.value.sort.desc = !query.value.sort.desc
							}
							query.value.sort.by = key
						},

						toUrlString: function () {
							//var params = Query.requestParams(query.value),
							var urlString = encodeURIComponent(btoa(JSON.stringify(query.value)))
							//console.log("query.toUrlString()", query.value, urlString)
							return urlString
						},

						toRequestParams: function () {
							return Query.requestParams(query.value)
						}
					}
					return query
				}

				Query.parseUrl = parseUrl
				Query.requestParams = requestParams

				return Query

				// parse browser url into new query instance
				function parseUrl() {
					if (!$stateParams.query) {
						return Query()
					}
					var query,
						value = parseUrlValue()
					query = Query(value)
					//console.log("parseUrl.query", query.value)
					return query
				}

				function parseUrlValue() {
					if (!$stateParams.query) {
						return undefined
					}
					var value
					try {
						value = JSON.parse(atob(decodeURIComponent($stateParams.query))) || {}
					} catch (err) {}
					return value
				}

				// apply defaults to query values
				function applyDefaults(params) {
					var defaults = _.merge({
						search: undefined,
						page: 1,
						limit: 40,
						sort: {
							by: 'createdAt',
							desc: true
						}
					}, params)

					//console.log("applyDefaults.defaults:", defaults)
					return defaults
				}

				// generate $http params object
				function requestParams(params) {
					if (!params) {
						return
					}
					params = angular.copy(params)
					if (params.sort) {
						params.sort = params.sort.by +" "+ (params.sort.desc ? 'DESC' : 'ASC')
					}
					return params
				}
			}
		])

		.run([
			"$rootScope",
			"$state",
			"$location",
			"$timeout",
			"Restangular",
			"localStorageService",
			"laicos.ui.util.Strip",
			function ($rootScope,
								$state,
								$location,
								$timeout,
								Restangular,
								localStorageService,
								Strip) {
				Restangular
					.addFullRequestInterceptor(function (element, operation, route, url, headers, params, httpConfig) {
						//console.log(operation, route, url, element)
						var token = localStorageService.get('aWJoc3Rva2Vu')
						if (!token) {
							localStorageService.clearAll()
							$state.go("login")
							return
						}

						var requestType = route + "." + operation

						switch (requestType) {
							case 'form.put':
								element = Strip.angular(element)
								break;
						}

						var request = {
							element: element,
							params: params,
							headers: _.extend(headers, {
								Authorization: 'Bearer ' + localStorageService.get('aWJoc3Rva2Vu').token
							}),
							httpConfig: httpConfig
						}

						return request
					})
					.setErrorInterceptor(function (response, deferred, responseHandler) {
						switch (response.status) {
							case 403:
								localStorageService.clearAll()
								$state.go("login")
								return true
						}
						return true
					})
					.addResponseInterceptor(function (json, operation, what, url, response, deferred) {
						//console.log('intercepted', operation, what, url, json)
						if (!json.success) {
							deferred.reject()
						}
						switch (what) {
							case 'admin/login':
								return json
						}
						return json.data
					})

				$rootScope.$state = $state
				$rootScope.isBusy = true

				$rootScope
					.$on('$stateChangeStart', function (event) {
						$rootScope.isBusy = true
					})

				$rootScope
					.$on('$stateChangeSuccess', function (event) {
						$rootScope.isBusy = false
					})

				$rootScope
					.$on('$stateChangeError', function (err, toState) {
						console.error('$stateChangeError', toState, err)
						return
						$timeout(function () {
							switch (toState.name) {
								case "users.user":
								case "users":
									$location.path("/users")
									break;

								case "formslist":
								case "form":
									$location.path("/formslist")
									break;

								default:
									$location.path("/")
							}
						}, 3000)
						$rootScope.isBusy = false
					})
			}
		])

})(window, window.angular);
;
(function (angular) {
	"use strict";

	angular.module("ibhs")

		.config([
			"$stateProvider",
			function ($stateProvider) {
				$stateProvider
					.state("dashboard", {
						url: "/",
						views: {
							menu: {
								template: "<div></div>"
							},
							content: {
								templateUrl: "/ibhs/dashboard/Dashboard.html",
								controller: "ibhs.dashboard.Dashboard"
							}
						}
					})
			}
		])

		.controller("ibhs.dashboard.Dashboard", [
			"$state",
			"ibhs.login.Auth",
			function ($state, Auth) {
				if (!Auth.isAuthenticated()) {
					return $state.go("login")
				}
				$state.go("formslist")
			}
		])

})(window.angular);
(function (angular) {
    "use strict";

    angular.module("ibhs.form", [
		"ngAnimate",
		"laicos.datacollector.forms"
    ])

		.config([
			"$stateProvider",
			function ($stateProvider) {

			    $stateProvider
					.state('form', {
					    url: "/forms/:formId",
					    views: {
					        menu: {
					            templateUrl: "/ibhs/nav/Nav.html",
					            controller: "ibhs.nav.Nav"
					        },
					        content: {
					            templateUrl: "/ibhs/form/Form.html",
					            controller: "ibhs.form.Form",
					            resolve: {
					                userform: [
										"$stateParams",
										"Restangular",
										function ($stateParams, Restangular) {
										    return Restangular
												.one("form", $stateParams.formId)
												.get()
												.then(function (userform) {
												    var cards = _.indexBy(userform.form.cards, "id")
												    userform.form.sections = _.map(userform.outline.sections, function (section) {
												        section.cards = _.map(section.cards, function (card) {
												            return cards[card.id]
												        })
												        return section
												    })
												    delete userform.form.cards
												    delete userform.outline

												    return userform
												})
										}
					                ]
					            }
					        }
					    }
					})
			}
		])

		.directive("ngVisibility", [
			function () {
			    return {
			        restrict: 'A',
			        link: function ($scope, $element, $attrs) {

			            $scope.$watch(_.debounce(function () {
			                var value = $scope.$eval($attrs.ngVisibility)
			                var visibility = value ? "visible" : "hidden"
			                //var opacity = value ? "1" : "0.2"
			                //console.log("ngVisibility", value)
			                $element.css({
			                    visibility: visibility
			                })
			            }, 1))
			        }
			    }
			}
		])

		.filter('filterSectionsByIds', [
			function () {
			    return function (sections, ids) {
			        if (!ids || _.isEmpty(ids)) {
			            return []
			        }
			        return _.filter(sections, function (section) {
			            return ids[section.id]
			        })
			    }
			}
		])

		.service("ibhs.form.Form", [
			"Restangular",
			function (Restangular) {

			    var Form = {
			        getAll: function (query) {
			            return Restangular
							.all("form/list")
							.getList(query)
			        }
			    }

			    return Form
			}
		])

		.controller("ibhs.form.Form", [
			"$scope",
			"$window",
			"$timeout",
			"$document",
			"$state",
			"$filter",
			"userform",
			"Restangular",
			"laicos.ui.util.BeforeLeave",
			"formsservice",
			function ($scope,
								$window,
								$timeout,
								$document,
								$state,
								$filter,
								userform,
								Restangular,
								BeforeLeave,
								FormService) {
			    console.log("ibhs.form.Form")
			    var navigableBottomBuffer = 10,
					currentNavItem,
					currentContentItem,
					scroller,
					formWorker = new Worker('form.worker.js')

			    BeforeLeave.on(function () {
			        if ($scope.IbhsForm.$dirty) {
			            return 'Unsaved Changes for "' + $scope.userform.form.name + '"'
			        }
			    })

			    formWorker.addEventListener('message', onWorkerMessage, false)

			    $scope.history = [angular.copy(userform)]
			    $scope.userform = userform
			    $scope.$sectionIndex = 0
			    //$scope.cardDependencyList = FormService.data.flattenUserFormSections($scope.userform)

			    $scope.isBusy = false
			    //console.log($scope.userform.form)
			    $scope.filter = {
			        value: undefined
			    }

			    $scope.jumpTo = function (id) {
			        var delay = 0
			        if ($scope.filter.value) {
			            $scope.filter.value = undefined
			            delay = 500
			        }
			        setTimeout(function () {
			            $("#content-" + id)
							.velocity("scroll", {
							    container: $(".form-content-scroll-container"),
							    offset: -50,
							    easing: "swing"
							}
						)

			            /*element.scrollIntoView({
						 behavior: "smooth"
						 })*/
			        }, delay)
			    }

			    $scope.save = function () {
			        $scope.isBusy = true
			        // flatted cards
			        var post = Restangular.copy($scope.userform)
			        post.form.cards = []
			        angular.forEach(post.form.sections, function (section) {
			            post.form.cards = post.form.cards.concat(section.cards)
			        })
			        delete post.form.sections
			        post.save()
						.then(function () {
						    $scope.isBusy = false
						    $scope.IbhsForm.$setPristine()
						})
			    }

			    $scope.digested = function () {
			        console.log("digested")
			    }

			    $scope.undo = function () {
			        if ($scope.history.length < 2) {
			            return
			        }
			        $scope.userform = angular.copy($scope.history[$scope.history.length - 2])
			        $scope.history.length--
			        updateCardDependencyList()
			        $scope.IbhsForm.$setDirty()
			    }

			    $scope.undoAll = function () {
			        if ($scope.history.length < 2) {
			            return
			        }
			        $scope.userform = angular.copy($scope.history[0])
			        $scope.history.length = 1
			        updateCardDependencyList()
			        $scope.IbhsForm.$setDirty()
			    }

			    $scope.hasNoResults = function () {
			        if (!$scope.filter.value) {
			            return false
			        }
			        return !~_.findIndex($scope.userform.form.sections, function (section) {
			            return angular.isDefined(section.$cards) && section.$cards.length
			        })
			    }

			    $scope.digested = function () {
			        console.log('digested')
			    }

			    $scope.onQuestionChange = _.debounce(function (question) {
			        $scope.$evalAsync(function () {
			            $scope.history.push(angular.copy($scope.userform))
			            if (question.hasDependents)
			                sendToWorker("getItAll", $scope.userform)
			        })
			    }, 100)



			    $scope.$on("$destroy", function () {
			        formWorker.terminate()
			        BeforeLeave.off()
			        if (scroller)
			            scroller.destroy()
			    })

			    init()

			    function init() {
			        sendToWorker("getItAll", $scope.userform)

			        setTimeout(function () {
			            scroller = new FTScroller(document.getElementById('scroller'), {
			                scrollingX: false,
			                bouncing: false,
			                flinging: false,
			                //alwaysScroll: true
			            })
			            scroller.addEventListener("scroll", function () {
			                $scope.$evalAsync(updateActiveItems)
			                //$timeout(updateActiveItems)
			            })
			        })
			    }

			    function updateActiveItems() {
			        if (currentContentItem)
			            currentContentItem.classList.remove("active")

			        updateVisibleSections()
			        currentContentItem = getContentItem()

			        if (currentNavItem)
			            currentNavItem.classList.remove("active")

			        // highlight active items
			        if (currentContentItem) {
			            var id = 'nav-' + currentContentItem.id.replace("content-", "")
			            currentContentItem.classList.add("active")
			            currentNavItem = $document[0].getElementById(id)
			            if (currentNavItem) {
			                currentNavItem.classList.add("active")

			                var rect = currentNavItem.getBoundingClientRect()

			                if (rect.top < 100 || rect.bottom > $window.innerHeight) {
			                    $("#" + id)
									.velocity("scroll", {
									    container: $(".form-menu-scroll-container"),
									    easing: "swing"
									}
								)
			                }
			                return
			                // keep in visible viewport
			                if (rect.top < 100) {
			                    currentNavItem.scrollIntoView()

			                } else if (rect.bottom > $window.innerHeight) {
			                    currentNavItem.scrollIntoView(false)
			                }
			            }
			        } else {
			            // maybe jump to top?
			        }
			    }

			    function onWorkerMessage(event) {
			        try {
			            $scope.$evalAsync(function () {
			                var message = JSON.parse(event.data)
			                switch (message.type) {
			                    case "getItAll":
			                        $scope.filteredSectionIds = message.data.sections
			                        /*angular.forEach($scope.sections, function(section) {
									 var match = _.find($scope.userform.form.sections, function(s) {
									 console.log(s.id, section.id)
									 if (s.id == section.id) {

									 }
									 })
									 if (match) {
									 match = angular.extend(section)
									 }
									 })*/
			                        $scope.menu = message.data.menu
			                        $scope.isBusy = false
			                        break;
			                }
			            })
			        } catch (err) {
			            console.error(err)
			        }
			    }

			    function sendToWorker(type, data) {
			        $scope.isBusy = true
			        formWorker.postMessage(JSON.stringify({
			            type: type,
			            data: data
			        }))
			    }

			    $scope.console = console

			    function updateVisibleSections() {
			        // update section visibility
			        var items = $document[0].querySelectorAll(".sections .section"),
						halfWindow = $window.innerHeight * 0.5,
						$index
			        if (items && items.length) {
			            currentContentItem = _.find(items, function (item, k) {
			                var rect = item.getBoundingClientRect(),
								bottom = rect.top + rect.height - navigableBottomBuffer
			                //console.log(rect.top, rect.height, rect.bottom)
			                var isCurrent = bottom > halfWindow
			                if (isCurrent) {
			                    $index = k
			                }
			                return isCurrent
			            })
			            if (!currentContentItem) {
			                currentContentItem = items[0]
			                $index = 0
			            }
			            $scope.$sectionIndex = $index
			        }
			    }

			    function getContentItem() {
			        // find first visible item
			        var items = $document[0].querySelectorAll(".content .navigable")
			        if (items && items.length) {
			            currentContentItem = _.find(items, function (item) {
			                var rect = item.getBoundingClientRect(),
								bottom = rect.top + rect.height - navigableBottomBuffer
			                return bottom > 50
			            })
			            if (!currentContentItem) {
			                currentContentItem = items[0]
			            }
			        }
			        return currentContentItem
			    }
			}
		])

})(window.angular);

;
(function (angular) {
    "use strict";

    angular.module("ibhs.form")

		.config([
			"$stateProvider",
			function ($stateProvider) {

			    $stateProvider
					.state('formslist', {
					    url: "/formslist?query",
					    reloadOnSearch: false,
					    views: {
					        menu: {
					            templateUrl: "/ibhs/nav/Nav.html",
					            controller: "ibhs.nav.Nav"
					        },
					        content: {
					            templateUrl: "/ibhs/form/Forms.html",
					            controller: "ibhs.form.Formslist",
					            resolve: {
					                formslist: [
										"$stateParams",
										"Restangular",
										function ($stateParams, Restangular) {
										    try {
										        var query
										        if ($stateParams.query) {
										            query = JSON.parse(atob(decodeURIComponent($stateParams.query)))
										        } else {
										            query = {}
										        }
										        query.paginate = {
										            page: 1,
										            limit: 40
										        }
										        return Restangular
													.all("form/list")
													.getList(query)
										    } catch (err) {
										        console.error(err)
										    }
										}
					                ]
					            }
					        }
					    }
					});
			}
				
			
		])

		.controller("ibhs.form.Formslist", [
			"$scope",
			"$element",
			"$q",
			"$state",
			"$filter",
			"$mdDialog",
			"formslist",
			"Restangular",
			"laicos.ui.util.Strip",
            "formsservice",
            "localStorageService",
			function ($scope,
								$element,
								$q,
								$state,
								$filter,
								$mdDialog,
								formslist,
								Restangular,
								Strip,
                                FormService,
                                localStorageService
                                ) {
			    console.log("ibhs.form.Forms")
			    var query = {},
					limit = 40

			    var token = localStorageService.get("aWJoc3Rva2Vu").token;

			    $scope.page = 1
			    $scope.isLoading = false
			    $scope.forms = formslist
			    $scope.$state = $state
			    $scope.$mdDialog = $mdDialog
			    applyQueryUrltoScope(parseQueryUrl())

			    $scope.autocomplete = {
			        user: undefined
			    }

			    $scope.onScrollForms = function (event) {
			        if (event.remainingPixels <= 100 && !$scope.forms.isLoading && !$scope.forms.atEnd) {
			            getMore()
			        }
			    }

			    $scope.sortBy = function (key) {
			        $scope.forms.isLoading = true
			        $scope.forms.length = 0
			        if ($scope.sort.by == key) {
			            $scope.sort.desc = !$scope.sort.desc
			        }
			        $scope.sort.by = key
			        $scope.queryContent()
			    }

			    setTimeout(function () {
			        $scope.$on('$locationChangeSuccess', onLocationChange)
			    }, 1)

			    $scope.getSelectedForms = getSelectedForms

			    $scope.exportCsv = function () {
			        $scope.$emit('popsauce:close')
			        var formIds = _.map(getSelectedForms(), 'id')
			        if (!formIds.length) {
			            return
			        }
			        $scope.export = {
			            isWorking: true,
			            data: undefined
			        }
			        getFormsById(formIds)
						.then(function (result) {
						    var forms = _.map(result, function (form) {
						        return Strip.angular(Restangular.stripRestangular(form))
						    })

						    var data = getFormAnswers(forms);
						    //forms = flattenForCsv(forms)
						    var csv = Papa.unparse(data)
						    setTimeout(function () {
						        $scope.$evalAsync(function () {
						            $scope.export.name = 'Post_Disaster_Data-' + new Date().getTime() + '.csv'
						            $scope.export.data = "data:text/csv;charset=utf-8," + encodeURI(csv)
						        })
						    }, 500)
						})
			    }

			    $scope.cancelExport = function () {
			        $scope.export = {}
			    }

			    $scope.onChangeUserSearch = function () {
			        //console.log('onChangeUserSearch', $scope.autocomplete.user)
			        // autocomplete list request
			    }

			    $scope.onKeypressUserSearch = function (event) {
			        switch (event.which) {
			            case 13:
			                // add username
			                if (!~_.indexOf($scope.search["user.username"].$in, $scope.autocomplete.user))
			                    $scope.search["user.username"].$in.unshift($scope.autocomplete.user)
			                $scope.autocomplete.user = undefined
			                break;
			        }
			    }

			    $scope.removeTag = function (username) {
			        var index = _.indexOf($scope.search["user.username"].$in, username)
			        if (~index) {
			            $scope.search["user.username"].$in.splice(index, 1)
			        }
			    }

			    $scope.queryContent = function () {
			        $scope.page = 1
			        var query = buildQueryUrl(),
						queryUrl = query ? encodeURIComponent(btoa(JSON.stringify(query))) : undefined
			        $state.go("formslist", {
			            query: queryUrl
			        })
			    }

			    $scope.viewForm = function (form, event) {
			        if (event) {
			            event.stopPropagation()
			        }
			        $state.go("form", {
			            formId: form.id || form._id
			        })
			    }

			    function getFormsById(ids) {
			        var promises = _.map(ids, function (id) {
			            return Restangular
							.one('form', id)
							.get()
			        })

			        return $q
						.all(promises)
			    }

			    function getFormAnswers(forms) {

			        var answers = [];
			        var curAnswers = null;
			        var curCard = null;
			        var curQ = null;

			        function getAnswer(question, validSection, validCard, validQ) {

			            var valid = true;
			            var retVal = null;
			            if (typeof validSection === 'object' && validSection !== null && validSection.hasOwnProperty('failedDefaultVal')) {
			                // section failed and has default fail value
			                retVal = validSection.failedDefaultVal.value || validSection.failedDefaultVal;
			                valid = false;
			            } else if (typeof validCard === 'object' && validCard !== null && validCard.hasOwnProperty('failedDefaultVal')) {
			                retVal = validCard.failedDefaultVal.value || validCard.failedDefaultVal;
			                valid = false;
			            } else if (typeof validQ === 'object' && validQ !== null && validQ.hasOwnProperty('failedDefaultVal')) {
			                retVal = validQ.failedDefaultVal.value || validQ.failedDefaultVal;
			                valid = false;
			            } else {
			                valid = validSection === true && validCard === true && validQ === true;
			            }// if-else

			            switch (question.type.key) {

			                case 'toggle':
			                case 'checkbox':
			                    return valid ? question.answer ? 'yes' : 'no' : 'n/a';

			                case 'dropdown':
			                case 'multi-choice':
			                    return valid && question.answer ? question.answer.name : (retVal ? retVal : 'n/a');

			                case 'counter':
			                    return valid && question.answer !== null && question.answer !== undefined ? question.answer : (retVal !== null ? retVal : '0');

			                case 'slider':
			                    return valid && question.answer !== null && question.answer !== undefined ? question.answer : (retVal !== null ? retVal : 'n/a');

			                case 'yes-no':
			                    return valid ? question.answer || 'no' : (retVal !== null ? retVal : 'n/a');

			                case 'photo':
			                    return valid && question.answer && question.answer.remotePath ? (window.IBHS_ADMIN_URL || window.location.origin) + '/image/' + token + question.answer.remotePath : 'n/a';
                                

			                default:
			                    return valid ? question.answer || '' : (retVal !== null ? retVal : 'n/a');
			            };
			        };

			        var fieldIdx = 0;

			        _.each(forms, function (curForm) {

			            curAnswers = {
			                FormName: curForm.identifier,
			                gps_longitude: curForm.gps ? curForm.gps.longitude : 'n/a',
			                gps_latitude: curForm.gps ? curForm.gps.latitude : 'n/a'
			            };
			            var depAnswers = FormService.data.flattenUserFormQuestions(curForm,
                                    function (question) {
                                        return question.hasDependents;
                                    });

			            for (var i = 0; i < curForm.form.cards.length; i++) {
                            
			                curCard = curForm.form.cards[i];
			                var validSection = FormService.evaluator.evalDependency(curCard.section, depAnswers, true); // evaluate if section is valid
			                var validCard = FormService.evaluator.evalDependency(curCard, depAnswers, true); // evaluate if card is valid
			                var validQ = false;

			                if (curCard.questions) {
			                    for (var j = 0; j < curCard.questions.length; j++) {
			                        curQ = curCard.questions[j];

			                        if (curQ) {
			                            if (curQ.fieldName.indexOf('Elevation : Exterior Attachment1 Car Port Damage') > -1) {
			                                var x = '';
			                            }

			                            

			                            validQ = FormService.evaluator.evalDependency(curQ, depAnswers, true);
			                            fieldIdx++;
                                        curAnswers[curQ.fieldName || 'column' + fieldIdx] = getAnswer(curQ, validSection, validCard, validQ);
			                           

			                        }// if
			                    }// for questions
			                } // if
			            }// for cards

			            answers.push(curAnswers);
			            fieldIdx = 0;

			        });// each form


			        return answers;

			    }

			    function flattenForCsv(forms) {
			        var flattened = {
			            fields: [],
			            data: []
			        },
						fields = {},
						addToRow = function (row, key, value) {
						    //console.log("addToRow", key, value)
						    fields[key] = true
						    row[key] = value
						}
			        _.each(forms, function (submission) {
			            //console.log(submission.name)
			            _.each(submission.form.cards, function (card) {
			                //console.log("card", card)
			                _.each(card.questions, function (question) {
			                    //console.log("question", question)
			                    var row = {},
									answerCol = question.text || (question.type ? question.type.label : ""),
									answerVal = _.isObject(question.answer)
										? question.answer.value
										: question.answer
			                    addToRow(row, 'Form', submission.form.name)
			                    addToRow(row, 'Created', submission.form.createdAt)
			                    addToRow(row, 'Updated', submission.form.updatedAt)
			                    if (card.section.title) {
			                        //row.section = card.section.title
			                        addToRow(row, card.section.title, "✓")
			                    }
			                    //row.formId = submission.form._id
			                    if (card.section.description) {
			                        //row['section.description'] = card.section.description
			                        addToRow(row, card.section.description, "✓")
			                    }

			                    if (card.title) {
			                        //row.card = card.title || card.body
			                        addToRow(row, card.title, "✓")//true
			                    }

			                    addToRow(row, answerCol, answerVal)

			                    row = _.mapKeys(row, function (value, key) {
			                        return _.capitalize(key)
			                    })
			                    flattened.data.push(row)
			                })
			            })
			        })
			        flattened.fields = _.chain(fields)
						.keys()
						.map(_.capitalize)
						.valueOf()
			        return flattened
			    }

			    function getSelectedForms() {
			        return _.filter($scope.forms, function (form) {
			            return form.$selected
			        })
			    }

			    function applyQueryUrltoScope(query) {
			        //console.log("applyQueryUrltoScope", query)
			        if (query.q && query.q.createdAt) {
			            query.q.createdAt.$lte = $filter("date")(query.q.createdAt.$lte, "MMMM d, y")
			            query.q.createdAt.$gte = $filter("date")(query.q.createdAt.$gte, "MMMM d, y")
			        }
			        $scope.sort = {
			            by: 'createdAt',
			            desc: true
			        }
			        if (query && query.sort) {
			            $scope.sort.by = _.keys(query.sort)[0]
			            $scope.sort.desc = _.values(query.sort)[0] != 'ASC'
			        }
			        $scope.search = angular.extend({
			            text: undefined,
			            "user.username": {
			                $in: []
			            },
			            createdAt: undefined
			        }, query.q)
			    }

			    function getMore() {
			        $scope.page++
			        $scope.forms.isLoading = true
			        var query = parseQueryUrl()
			        if (!query) {
			            query = {}
			        }
			        query.paginate = {
			            page: $scope.page,
			            limit: limit
			        }
			        $scope.forms
						.getList(query)
						.then(function (response) {
						    if (!response || !response.length) {
						        $scope.forms.atEnd = true
						        return
						    }
						    angular.forEach(response, function (form) {
						        $scope.forms.push(form)
						    })
						})
						.finally(function () {
						    $scope.forms.isLoading = false
						})
			    }

			    function onLocationChange() {
			        var query = parseQueryUrl()
			        applyQueryUrltoScope(query)
			        query.paginate = {
			            page: 1,
			            limit: limit
			        }
			        $scope.forms.atEnd = false
			        $scope.forms.isLoading = true
			        $scope.forms.getList(query)
						.then(function (response) {
						    $scope.forms = response
						    $scope.forms.isLoading = false
						})
			    }

			    function parseQueryUrl() {
			        //console.log('parseQueryUrl')
			        if (!$state.params.query) {
			            return {}
			        }
			        var query
			        try {
			            query = JSON.parse(atob(decodeURIComponent($state.params.query))) || {}
			        } catch (err) {
			            query = {}
			        }
			        return applyQueryDefaults(query)
			    }

			    function applyQueryDefaults(query) {
			        //console.log('applyQueryDefaults', query)
			        if (!query.sort) {
			            query.sort = {
			                by: 'createdAt',
			                desc: true
			            }
			        }
			        return query
			    }

			    function buildQueryUrl() {
			        //console.log('buildQueryUrl')
			        var query = {
			            q: angular.copy($scope.search),
			            sort: {},
			            paginate: {
			                page: $scope.page,
			                limit: limit
			            }
			        }
			        query.sort[$scope.sort.by] = $scope.sort.desc ? 'DESC' : 'ASC'

			        if (query.q.createdAt) {
			            if (query.q.createdAt.$lte) {
			                query.q.createdAt.$lte = new Date(query.q.createdAt.$lte).setHours(23, 59, 59, 999)
			            } else {
			                delete query.q.createdAt.$lte
			            }

			            if (query.q.createdAt.$gte) {
			                query.q.createdAt.$gte = new Date(query.q.createdAt.$gte).setHours(23, 59, 59, 999)
			            } else {
			                delete query.q.createdAt.$gte
			            }
			            if (_.isEmpty(query.q.createdAt)) {
			                delete query.q.createdAt
			            }
			        }

			        if (!query.q.text)
			            delete query.q.text

			        if ($scope.autocomplete.user
						&& !~_.indexOf(query.q['user.username'].$in, $scope.autocomplete.user)) {
			            query.q['user.username'].$in.unshift($scope.autocomplete.user)
			        }

			        if (!query.q['user.username'].$in.length) {
			            delete query.q['user.username']
			        }

			        if (!query.q || _.isEmpty(query.q)) {
			            delete query.q
			        }

			        //console.log('the query', query)

			        return query || {}
			    }

			}
		])

})(window.angular);
;
(function (angular) {
	"use strict";

	angular.module("ibhs.login", [
		"ngAnimate",
		"restangular",
		"LocalStorageModule"
	])

		.config([
			"$stateProvider",
			function ($stateProvider) {

				$stateProvider
					.state('login', {
						url: "/login",
						views: {
							menu: {
								templateUrl: "/ibhs/nav/Nav.html",
								controller: "ibhs.nav.Nav"
							},
							content: {
								templateUrl: "/ibhs/login/Login.html",
								controller: "ibhs.login.Login",
								resolve: {
									isAuthenticated: [
										function () {
										}
									]
								}
							}
						}
					})
			}
		])

		.service("ibhs.login.Auth", [
			"localStorageService",
			"$q",
			"$state",
			"$document",
			"Restangular",
			"$mdDialog",
			function (localStorageService,
								$q,
								$state,
								$document,
								Restangular,
								$mdDialog) {
				var Auth = {
					isAuthenticated: function () {
						var token = localStorageService.get("aWJoc3Rva2Vu")
						if (!token) {
							return false
						}
						return true
					},

					login: function (user) {
						if (!user.username || !user.password) {
							return $q.reject("Invalid form")
						}
						return Restangular
							.all('admin/login')
							.post(user)
							.then(function (response) {
								localStorageService.set('user', response.user)
								localStorageService.set("aWJoc3Rva2Vu", {
									token: response.access_token,
									expiry: response.expiry
								})
								return response.user
							}, function (err) {
								throw err
							})
					},

					logout: function (event) {
						return Restangular
							.all('auth/logout')
							.customPUT()
							.finally(function () {
								$state.go("login")
								localStorageService.clearAll()
								location.reload(true)
							})
					}
				}

				return Auth
			}
		])

		.controller("ibhs.login.Login", [
			"$scope",
			"$state",
			"ibhs.login.Auth",
			function ($scope, $state, Auth) {
				console.log("ibhs.login.Login")

				$scope.user = {
					username: undefined,
					password: undefined
				}

				$scope.onSubmit = function () {
					delete $scope.err
					$scope.isBusy = true
					Auth
						.login($scope.user)
						.then(function (user) {
							delete $scope.err
							$state.go("formslist")
						}, function (err) {
							$scope.err = err.data
						})
						.finally(function () {
							$scope.isBusy = false
						})
				}

			}
		])

})(window.angular);

;
(function (angular) {
	"use strict";

	angular.module("ibhs.nav", [
		"ngAnimate",

		"ibhs.login"
	])

		.controller("ibhs.nav.Nav", [
			"$scope",
			"$state",
			"$document",
			"ibhs.login.Auth",
			"$mdDialog",
			function ($scope, $state, $document, Auth, $mdDialog) {
				if (!$state.current) {
					return
				}

				$scope.logout = function (event) {
					var confirm = $mdDialog.confirm()
						.parent(angular.element($document[0].body))
						.title('Log out of IBHS Admin?')
						//.content('All of the banks have agreed to forgive you your debts.')
						//.ariaLabel('Sign Out')
						.clickOutsideToClose(true)
						.ok('Log Out')
						.cancel('Cancel')
						.targetEvent(event)
					$mdDialog
						.show(confirm)
						.then(Auth.logout)
				}

				switch ($state.current.name) {
					case "users":
					case "users.user":
						$scope.$active = 'users'
						break;

					case "formslist":
					case 'form':
						$scope.$active = 'formslist'
						break;
				}
			}
		])

})(window.angular);
;
(function (angular) {
	"use strict";

	angular.module("ibhs.user", [
		"ngAnimate"
	])

		.config([
			"$stateProvider",
			function ($stateProvider) {

				$stateProvider
					.state("users.user", {
						url: "/:userId",
						controller: "ibhs.user.User",
						templateUrl: "/ibhs/user/User.html",
						resolve: {
							user: [
								"$state",
								"$stateParams",
								"Restangular",
								function ($state, $stateParams, Restangular) {
									if ($state.current.user) {
										return $state.current.user
									}
									if ("new" == $stateParams.userId) {
										return {
											active: true,
											type: "user",
											role: "agent"
										}
									}
									return Restangular
										.one("users", $stateParams.userId)
										.get()
								}
							]
						}
					})
			}
		])

		.controller("ibhs.user.User", [
			"$scope",
			"$document",
			"$rootScope",
			"$state",
			"Restangular",
			"laicos.ui.util.BeforeLeave",
			"ibhs.user.User",
			"user",
			function ($scope,
								$document,
								$rootScope,
								$state,
								Restangular,
								BeforeLeave,
								UserService,
								user) {
				console.log("ibhs.user.User")
				$scope.$state = $state
				$scope.user = user

				BeforeLeave.on(function() {
					if ($scope.UserForm.$dirty) {
						return 'Unsaved Changes for "' + ($scope.user.username || "User") + '"'
					}
				})

				/*$scope.accountTypes = [
					{label: 'user', value: 'user'},
					{label: 'admin', value: 'admin'}
				]*/

				$scope.accountRoles = [
					{label: 'agent', value: 'agent'},
					{label: 'admin', value: 'admin'}
				]

				$scope.confirmDeleteUser = function (event) {
					event.stopPropagation()
					if (!user.id) {
						return $state.go('users')
					}

					UserService
						.confirmDelete(user, event)
						.then(function () {
							deleteUser(user)
						})
				}

				$scope.save = function () {
					$scope.isBusy = true

					if (angular.isDefined(user.id)) {
						user.save()
							.then(function () {
								$scope.UserForm.$setPristine()
							}, function (err) {
								if (err) {
										return console.log('err', err)
									// display err
								}
								$scope.UserForm.$setPristine()
							})
							.finally(function () {
								$scope.isBusy = false
							})
					} else {
						// post new user
						Restangular
							.all("users")
							.post(user)
							.then(function (response) {
								var user = response[0]
								console.log('saved', response)
								$scope.UserForm.$setPristine()
								$rootScope.$broadcast("user.added", user)
								$state.go("users.user", {
									userId: user.id
								})
							}, function (err) {
								if (err) {
									return console.error(err)
									// display error
								}
							})
							.finally(function () {
								$scope.isBusy = false
							})
					}
				}

				$scope.$on("$destroy", function() {
					BeforeLeave.off()
				})

				function deleteUser(user) {
					user.remove()
						.then(function () {
							$rootScope.$broadcast("user.delete", user.id)
							$state.go("users")
						}, function (err) {
							// display error
						})
				}
			}
		])

		.service("ibhs.user.User", [
			"$q",
			"$document",
			"$mdDialog",
			function ($q, $document, $mdDialog) {
				var User = {
					confirmDelete: function (user, event) {
						var deferred = $q.defer(),
							confirm = $mdDialog.confirm()
								.parent(angular.element($document[0].body))
								.title('Delete user "' + user.username + '"?')
								//.content('All of the banks have agreed to forgive you your debts.')
								//.ariaLabel('Sign Out')
								.clickOutsideToClose(true)
								.ok('Delete')
								.cancel('Cancel')
								.targetEvent(event)
						$mdDialog
							.show(confirm)
							.then(deferred.resolve, deferred.reject)

						return deferred.promise
					}
				}

				return User
			}
		])

})(window.angular);
;
(function (angular) {
	"use strict";

	angular.module("ibhs.user")

		.config([
			"$stateProvider",
			function ($stateProvider) {

				$stateProvider
					.state('users', {
						url: "/users?query",
						reloadOnSearch: false,
						views: {
							menu: {
								templateUrl: "/ibhs/nav/Nav.html",
								controller: "ibhs.nav.Nav"
							},
							content: {
								templateUrl: "/ibhs/user/Users.html",
								controller: "ibhs.user.Users",
								resolve: {
									users: [
										"$stateParams",
										"Restangular",
										"ibhs.Query",
										function ($stateParams, Restangular, QueryService) {
											var query = QueryService.parseUrl()
											return Restangular
												.all("users")
												.getList(query.toRequestParams())
										}
									]
								}
							}
						}
					})

			}
		])

		.controller("ibhs.user.Users", [
			"$scope",
			"$state",
			"$rootScope",
			"$q",
			"ibhs.user.User",
			"ibhs.Query",
			"users",
			function ($scope,
								$state,
								$rootScope,
								$q,
								UserService,
								QueryService,
								users) {
				console.log("ibhs.user.Users")
				$scope.query = QueryService()
				$scope.$state = $state
				$scope.users = users

				$rootScope.$on("user.delete", function (event, id) {
					removeUser(id, true)
				})

				$rootScope.$on("user.added", function (event, user) {
					console.log("user.added", user)
					$scope.users.unshift(user)
				})

				$scope.onScrollUsers = function (event) {
					if (event.remainingPixels <= 10 && !$scope.users.isLoading && !$scope.users.atEnd) {
						getMore()
					}
				}

				$scope.createNewUser = function () {
					$state.current.user = {
						active: true,
						type: "user",
						role: "agent"
					}

					$state.go("users.user", {
						userId: 'new'
					})
				}

				$scope.selectUser = function (user) {
					//$state.current.user = user

					$state.go("users.user", {
						userId: user.id
					})
				}

				$scope.sortBy = function (key) {
					$scope.users.isLoading = true
					$scope.users.length = 0
					$scope.query.sort(key)
					$scope.queryContent()
				}

				$scope.onSearchChange = function () {
					console.log($scope.query.value.search)
					if (!$scope.query.value.search) {
						delete $scope.query.value.search
					}
					$scope.query.value.page = 0
					$scope.users.length = 0
					getMore()
				}

				setTimeout(function () {
					$scope.$on('$locationChangeSuccess', onLocationChange)
				}, 1)

				function getMore() {
					$scope.query.value.page++
					$scope.users.isLoading = true
					$scope.users
						.getList($scope.query.toRequestParams())
						.then(function (response) {
							if (!response || !response.length) {
								$scope.users.atEnd = true
								return
							}
							angular.forEach(response, function (form) {
								$scope.users.push(form)
							})
						})
						.finally(function () {
							$scope.users.isLoading = false
						})
				}

				function onLocationChange() {
					//console.log('onLocationChange', $state.current.name)
					switch ($state.current.name) {
						case 'users.user':
							return
					}

					$scope.query = QueryService.parseUrl()
					$scope.users.atEnd = false
					$scope.users.isLoading = true
					users.getList($scope.query.toRequestParams())
						.then(function (response) {
							$scope.users = response
							$scope.users.isLoading = false
						})
				}

				$scope.queryContent = function () {
					$state.go("users", {
						query: $scope.query.toUrlString()
					})
				}

				$scope.confirmDeleteUser = function (user, event) {
					event.stopPropagation()
					UserService
						.confirmDelete(user, event)
						.then(function () {
							//return user.remove()
							return 'good'
						})
						.catch($q.reject)
						.then(function () {
							removeUser(user)
						})
						.catch(function (err) {
							// display error
							console.error(err)
						})
				}

				function removeUser(user, alreadyDeleted) {
					var userId = angular.isObject(user)
							? user.id
							: user,
						index = _.findIndex($scope.users, function (item) {
							return item.id == userId
						})
					if (~index) {
						$scope.users.splice(index, 1)
					}
					if (!alreadyDeleted)
						user.remove()
				}
			}
		])

})(window.angular);