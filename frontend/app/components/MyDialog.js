import { Dialog, Zoom } from "@mui/material";
import React from "react";

const Transition = React.forwardRef(function Transition(props, ref) {
    return <Zoom ref={ref} {...props} />;
});

export default function MyDialog(props) {
    return (
        <Dialog
            TransitionComponent={Transition}
            transitionDuration={300}
            {...props}
        >
            {props.children}
        </Dialog>
    );
}
