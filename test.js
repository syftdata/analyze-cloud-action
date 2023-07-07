const { compareSchemas } = require("./diff");
console.log(
  compareSchemas(
    " ",
    `- name: TodoAdded
  eventType: TRACK
  fields:
    - name: title
      type: string
      isOptional: false
    - name: id
      type: any
      isOptional: false
    - name: isDone
      type: boolean
      isOptional: false
- name: TodoDeleted
  eventType: TRACK
  fields:
    - name: id
      type: number
      isOptional: false
    - name: isDone
      type: boolean
      isOptional: false
- name: TodoToggled
  eventType: TRACK
  fields:
    - name: id
      type: number
      isOptional: false
- name: TodoTitleUpdated
  eventType: TRACK
  fields:
    - name: id
      type: number
      isOptional: false

`
  )
);
