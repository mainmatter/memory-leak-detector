const glob = require("glob");
const fs = require("fs");

const { parse } = require("@babel/parser");
const { visit } = require("ast-types");

module.exports = function inventoryClasses(sourceDirectory) {
  const jsFiles = glob.sync(`${sourceDirectory}/**/*.{js,ts}`);
  console.log('Gathering user defined classes in: ', jsFiles);
  const classNames = jsFiles
    .map((file) => {
      const content = fs.readFileSync(file, { encoding: "utf-8" });
      return getClassNamesFromFile(content);
    })
    .reduce((acc, val) => acc.concat(val), []); // flatten

  return classNames;
};

function getClassNamesFromFile(fileContents) {
  let classNames = [];
  let parserOptions = {
    sourceType: "module",
    plugins: [
      "classProperties",
      "asyncGenerators",
      "dynamicImport",
      "decorators-legacy",
      "classPrivateProperties",
      "classPrivateMethods",
      "nullishCoalescingOperator",
      "optionalChaining",
      "typescript",
      "objectRestSpread",
    ],
  };
  let ast = parse(fileContents, parserOptions);
  visit(ast, {
    visitClassDeclaration({ node }) {
      if (node.id && node.id.name) {
        classNames.push(node.id.name);
      }
      return false; // do not traverse sub-tree
    },
  });
  return classNames;
}
