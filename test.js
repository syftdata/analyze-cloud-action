const { compareSchemas } = require("./diff");
const diff = compareSchemas(
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
);
const comment = `
Hi there, Syft found changes in event schemas. Please review the changes below:

### Added Events
| Event Name         |
| ------------------ |
${diff.addedEvents.map((e) => `|${e}         |`).join("\n")}

### Removed Events
| Event Name         |
| ------------------ |
${diff.removedEvents.map((e) => `|${e}         |`).join("\n")}

### Changed Events
| Event Name         | Changes  |
| ------------------ | -------- |
${diff.changedEvents
  .map(
    (e) =>
      `|${e.name}       | ${
        e.addedFileds.length + e.removedFields.length + e.changedFields.length
      } `
  )
  .join("\n")}
  `;
console.log(comment);
