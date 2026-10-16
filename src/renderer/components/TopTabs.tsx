import { AppBar, Grid, Tab, Tabs, Toolbar, Typography } from "@mui/material";
import React, { ReactElement } from "react";
import { Link } from "react-router-dom";

import metadata from "../../meta.json";

function TopTabs(): ReactElement {
  return (
    <AppBar
      position="sticky"
      color="secondary"
      sx={{
        "& .MuiToolbar-regular": {
          minHeight: 0,
        },
      }}
    >
      {/* Line the tab label up with the page heading, which sits in a Container
          with default gutters. The Tab supplies 16px of its own left padding,
          so only the remainder of the gutter is needed here. */}
      <Toolbar disableGutters sx={{ pl: { xs: 0, sm: 1 } }}>
        <Grid container spacing={1} sx={{ alignItems: "center" }}>
          <Grid>
            <Tabs value="/manage" indicatorColor="primary" textColor="primary">
              <Tab label="MANAGE CONNECTIONS" to="/manage" value="/manage" component={Link} />
            </Tabs>
          </Grid>
          <Grid>
            <Typography variant="subtitle2">
              {metadata.desktopVersion}-{metadata.gitHash}
            </Typography>
          </Grid>
        </Grid>
      </Toolbar>
    </AppBar>
  );
}
export default TopTabs;
