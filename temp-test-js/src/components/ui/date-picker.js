"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.DatePicker = DatePicker;
const jsx_runtime_1 = require("react/jsx-runtime");
const date_fns_1 = require("date-fns");
const locale_1 = require("date-fns/locale");
const lucide_react_1 = require("lucide-react");
const utils_1 = require("~/lib/utils");
const button_1 = require("./button");
const calendar_1 = require("./calendar");
const popover_1 = require("./popover");
function DatePicker({ value, onChange, className }) {
    return ((0, jsx_runtime_1.jsxs)(popover_1.Popover, { children: [(0, jsx_runtime_1.jsx)(popover_1.PopoverTrigger, { asChild: true, children: (0, jsx_runtime_1.jsxs)(button_1.Button, { variant: "outline", className: (0, utils_1.cn)("w-full justify-start text-left font-normal", !value && "text-muted-foreground", className), children: [(0, jsx_runtime_1.jsx)(lucide_react_1.Calendar, { className: "mr-2 h-4 w-4" }), value ? ((0, date_fns_1.format)(value, "PPP", { locale: locale_1.ru })) : ((0, jsx_runtime_1.jsx)("span", { children: "\u0412\u044B\u0431\u0435\u0440\u0438\u0442\u0435 \u0434\u0430\u0442\u0443" }))] }) }), (0, jsx_runtime_1.jsx)(popover_1.PopoverContent, { className: "w-auto p-0", align: "start", children: (0, jsx_runtime_1.jsx)(calendar_1.Calendar, { mode: "single", selected: value, onSelect: onChange, initialFocus: true }) })] }));
}
