import { toHump } from "vue-el-crud/utils";
import AddBtn from "./add-btn";
import ContextMenu from "./context-menu";
import Crud from "./crud";
import Dialog from "./dialog";
import Filter from "./filter";
import FilterGroup from "./filter-group";
import Flex1 from "./flex1";
import Form from "./form";
import Pagination from "./pagination";
import RefreshBtn from "./refresh-btn";
import Table from "./table";
import Vnode from "./vnode";


const modulesFiles = import.meta.globEager("./**/index.js") // vite
let components = Object.values(modulesFiles).reduce((prev, curr) => {
  let component = curr?.default
  if (component?.name) {
    prev[toHump(component.name.replace(/^v-/, ''))] = component
  }
  return prev
}, {})
export {
  AddBtn,
  ContextMenu,
  Crud,
  Dialog,
  Filter,
  FilterGroup,
  Flex1,
  Form,
  Pagination,
  RefreshBtn,
  Table,
  Vnode,
};
console.log(components);
export default components