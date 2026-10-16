import { Typography, Grid, IconButton, Divider } from "@mui/material";
import * as React from "react";
import { PropsWithChildren, ReactElement } from "react";

import VirtualClosedFolder from "../icons/VirtualClosedFolder";
import VirtualOpenFolder from "../icons/VirtualOpenFolder";

type VirtualFolderProps = {
  folderName: string;
  totalListeners: number;
  connectedListeners: number;
  children: React.ReactNode;
};

const VirtualFolderRow: React.FC<VirtualFolderProps> = ({
  folderName,
  totalListeners,
  connectedListeners,
  children,
}: PropsWithChildren<VirtualFolderProps>): ReactElement => {
  const [open, setOpen] = React.useState<boolean>(false);

  const toggleOpen = () => {
    setOpen(!open);
  };

  return (
    <Grid container>
      <Grid container size={12} sx={{ alignItems: "center", flexWrap: "nowrap" }}>
        <Grid size="auto">
          <IconButton
            key={"menuButton" + folderName}
            aria-label={"toggle listeners for " + folderName}
            component="span"
            onClick={toggleOpen}
            size="large"
          >
            {open ? <VirtualOpenFolder /> : <VirtualClosedFolder />}
          </IconButton>
        </Grid>
        <Grid size="grow" sx={{ minWidth: 0 }} onClick={toggleOpen}>
          <Typography variant="h6" noWrap title={folderName}>
            {folderName}
          </Typography>
        </Grid>
        <Grid
          container
          size="auto"
          sx={{ justifyContent: "flex-end", flexWrap: "nowrap" }}
          onClick={toggleOpen}
        >
          <Typography variant="subtitle2" noWrap>
            {connectedListeners} of {totalListeners} listening
          </Typography>
        </Grid>
        {/* Keeps the counts clear of the menu column the other rows carry. */}
        <Grid size="auto" sx={{ width: 48 }} />
      </Grid>
      <Grid size={12}>
        <Divider />
      </Grid>
      {open && children}
    </Grid>
  );
};

export default VirtualFolderRow;
