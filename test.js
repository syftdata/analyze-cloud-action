const { compareSchemas } = require("./diff");
console.log(compareSchemas("- hi\n- wow", "- wow"));
