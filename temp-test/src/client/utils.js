"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.useToast = void 0;
const react_hot_toast_1 = require("react-hot-toast");
const useToast = () => {
    return {
        toast: (props) => {
            (0, react_hot_toast_1.toast)(props.title, {
                duration: 4000,
                style: props.variant === 'destructive'
                    ? { background: '#ef4444', color: 'white' }
                    : undefined,
            });
            if (props.description) {
                (0, react_hot_toast_1.toast)(props.description, {
                    duration: 4000,
                    style: props.variant === 'destructive'
                        ? { background: '#ef4444', color: 'white' }
                        : undefined,
                });
            }
        },
    };
};
exports.useToast = useToast;
