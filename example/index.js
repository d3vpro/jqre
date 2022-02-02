import {
    jqre
} from '../modules/jqre.js';

$(document).ready(function() {
    (async() => {
        window.$ = await jqre(['all']);
        // give it a name
        $.r.define("test-input-2", {
            // template to utilize
            data: {
                template: `<div class="input_wrapper"> <p class="heading">add</p> <span class='add_btn icon is-size-6'> <span class='hvr-grow'> <i class='icon icon-add hvr-icon'></i> </span> <span></span> </span> <span class="help_wrapper"></span><div class="control expand_up"> <div class="toggle noDisplay" class="is-flex is-flex-direction-row is-align-items-center" style="min-width: 200px; "> <input class="input is-success" type="text" placeholder="Add"> <span class="focus-border"></span> </div> </div>`,
                table: "task",
                column: "name",
                problem_id: false,
                cheatsheet_id: false,
                tag_snippet_id: false,
                task_id: false,
                object: {},
                targetElement: ".test_results",
                type: ["list", "row", "card"]
            },
            methods: {
                addToElement(type, value) {
                    console.log(this.targetElement.val())
                    let targetElement = this.targetElement.val()
                    console.log(value)
                    if (type === "problem") {
                        let newE = $(document.createElement("p"))
                        newE.html(value.problem)
                        $(targetElement).append(newE)
                    } else if (type === "task") {
                        let newE = $(document.createElement("p"))
                        newE.html(value.name)
                        $(targetElement).append(newE)
                    } else if (type === "cheatsheet") {
                        let newE = $(document.createElement("p"))
                        newE.html(value.title)
                        $(targetElement).append(newE)
                    } else {
                        let newE = $(document.createElement("p"))
                        newE.html(value.snippet)
                        $(targetElement).append(newE)
                    }
                },
                print: function() {
                    console.log('app $el', this.$el)
                    console.log('app $id and $parent', this.$id, this.$parent);
                    console.log('definitions', $.r.listDefinitions());
                    console.log('instances', $.r.listInstances());
                    console.log('instances custom events', $.r.listInstancesCustomEvents());
                    console.log('instances restore data', $.r.listInstancesRestoreData());
                    console.log('state', $.r.listState());
                    console.log('state update events', $.r.listStateUpdateEvents());
                },
                getData() {
                    if (this.tag_snippet_id.val()) {
                        let tag_snippet_id = parseInt(this.$el.data().tag_snippet_id)
                        this.object["tag_snippet_id"] = tag_snippet_id
                    }
                    if (this.problem_id.val()) {
                        let problem_id = parseInt(this.$el.data().problem_id)
                        this.object["problem_id"] = problem_id
                    }
                    if (this.cheatsheet_id.val()) {
                        let cheatsheet_id = parseInt(this.$el.data().cheatsheet_id)
                        this.object["cheatsheet_id"] = cheatsheet_id
                    }
                    if (this.task_id.val()) {
                        let task_id = parseInt(this.$el.data().task_id);
                        this.object["task_id"] = task_id
                    }
                },
                post(table, object) {
                    axiosPost(table, object).then((response) => {
                        this.addToElement(this.table.val(), response)
                        this.unset()
                    })
                },

                unset() {
                    this.object.unset("tag_snippet_id")
                    this.object.unset("task_id")
                    this.object.unset("problem_id")
                    this.object.unset(this.column.val())
                    this.object.unset("cheatsheet_id")
                }
            },
            // val(), set(), unset()
            events: {
                create: function() {
                    this.getData()
                    let template = this.template.val()
                    let newElement = $(template)
                    this.$el.append(newElement)
                },
                click: {
                    ".add_btn": function(event) {
                        console.log("clicked")
                        console.log(this.$el.find(".toggle"))
                        this.$el.find(".toggle").removeClass("noDisplay").addClass("animate__animated animate__fadeInDown")
                        this.$el.find(".add_btn").addClass("animate__animated animate__fadeOutRight")
                        setTimeout(() => {
                            this.$el.find(".add_btn").addClass("noDisplay").removeClass("animate__animated animate__fadeOutRight")
                        }, 300)
                        setTimeout(() => {
                            this.$el.find(".toggle").removeClass("animate__animated animate__fadeInDown")
                        }, 800)
                    }
                },
                keydown: {
                    ".input": function(event) {
                        if (event.target.value.length === 1) {
                            let helper = $(document.createElement("p"))
                            helper.addClass("help")
                            helper.html("Click enter to submit")
                            this.$el.find(".help_wrapper").append(helper)
                        }
                        if (event.keyCode === 13) {
                            let name = event.target.value
                            if (name.length > 0) {
                                console.log("column", this.column.val())
                                console.log("input", name)
                                this.object.set(this.column.val(), name)
                                console.log("OBJECT TO POST", this.object.val())
                                console.log("Table name", this.table.val())
                                let tableName = this.table.val().trim()
                                this.post(tableName, this.object.val())
                                this.$el.find(".input").val("")
                                this.$el.find(".toggle").addClass("animate__animated animate__fadeOutUp")
                                this.$el.find(".help_wrapper").addClass("animate__animated animate__fadeOutUp")
                                setTimeout(() => {
                                    this.$el.find(".toggle").addClass("noDisplay")
                                    this.$el.find(".help_wrapper").addClass("noDisplay")
                                }, 400)
                                setTimeout(() => {
                                    this.$el.find(".add_btn").removeClass("noDisplay").addClass("animate__animated animate__fadeIn")
                                }, 600)
                                setTimeout(() => {
                                    this.$el.find(".add_btn").removeClass("animate__animated animate__fadeIn")
                                    this.$el.find(".toggle").removeClass("animate__animated animate__fadeOutUp")
                                    this.$el.find(".help_wrapper").removeClass("animate__animated animate__fadeOutUp")
                                }, 1000)
                            }
                        }


                    }
                }
            }
        })

        $.r.init("app2", {
            type: "test-input-2",
            el: "#app9",
            data: {
                table: "task",
                column: "name",
                problem_id: true,
                cheatsheet_id: false,
                task_id: false,
            }
        })
        $.r.init("app3", {
            type: "test-input-2",
            el: "#app8",
            data: {
                table: "problem",
                column: "problem",
                problem_id: false,
                cheatsheet_id: false,
                task_id: false,
            }
        })
        $.r.init("app4", {
            type: "test-input-2",
            el: "#app7",
            data: {
                table: "cheatsheet",
                column: "title",
                problem_id: false,
                cheatsheet_id: false,
                task_id: false,
            }
        })
        console.log('definitions', $.r.listDefinitions());
        console.log('instances', $.r.listInstances());
        console.log('instances custom events', $.r.listInstancesCustomEvents());
        console.log('instances restore data', $.r.listInstancesRestoreData());
        console.log('state', $.r.listState());
    })()
})