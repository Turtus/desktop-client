import { AppBar, Autocomplete, Grid, TextField, Toolbar } from "@mui/material";
import { createFilterOptions } from "@mui/material/useAutocomplete";
import React, { FC, useEffect, useState } from "react";
import { Search } from "react-feather";

import { GET_ALL_RECORDS, VIEW } from "../../shared/constants";
import { ipcRenderer } from "../../shared/electron";
import { Record as ListenerRecord } from "../../shared/pb/types";
import { byConnectionName } from "../../shared/sorting";
import Logo from "../icons/Logo";
import TopTabs from "./TopTabs";

const TopBar: FC = () => {
  const [connections, setConnections] = useState([] as ListenerRecord[]);
  const [filter, setFilter] = useState("");

  const handleChange = (_e, conn) => {
    if (conn?.id) {
      ipcRenderer.send(VIEW, conn.id);
    }
  };

  const fetch = () => {
    ipcRenderer.once(GET_ALL_RECORDS, (_e, args) => {
      if (!args.err) {
        setConnections([...args.res.records].sort(byConnectionName));
      }
    });
    ipcRenderer.send(GET_ALL_RECORDS);
  };

  const filterOptions = createFilterOptions({
    stringify: (option: ListenerRecord) =>
      option.tags.join(" ") + (option?.conn?.name || "") + (option?.conn?.remoteAddr || ""),
  });

  useEffect(() => {
    fetch();
  }, []);

  return (
    <AppBar position="sticky">
      <Toolbar>
        {/* The Toolbar is a flex row, so the container needs an explicit width
            to span it -- otherwise it shrinks to its content and the search
            collapses to a sliver. */}
        <Grid container sx={{ alignItems: "center", width: "100%" }}>
          <Grid size="grow">
            <Logo />
          </Grid>
          <Grid size="auto" sx={{ width: { xs: 200, sm: 280, md: 340 } }}>
            <Autocomplete
              id="search"
              sx={{
                "& .MuiAutocomplete-popupIndicatorOpen": {
                  transform: "none",
                },
              }}
              // Let the dropdown grow past the input so connection names stay
              // readable instead of wrapping a word per line.
              slotProps={{
                // Autocomplete pins the popper to the input's width, which makes
                // long connection names wrap a word per line. Widen it to fit the
                // names and anchor it to the input's right edge so it grows inward
                // instead of off the side of the window.
                popper: {
                  placement: "bottom-end",
                  style: {
                    width: "max-content",
                    minWidth: 200,
                    maxWidth: "min(480px, calc(100vw - 32px))",
                  },
                },
              }}
              options={connections}
              filterOptions={filterOptions}
              getOptionLabel={(option: ListenerRecord) => option?.conn?.name || ""}
              isOptionEqualToValue={(option: ListenerRecord, value: ListenerRecord) => {
                return option.id === value.id;
              }}
              inputValue={filter}
              clearOnBlur
              onOpen={fetch}
              onInputChange={(_e, newInputValue, reason) => {
                if (reason === "reset") {
                  setFilter("");
                } else {
                  setFilter(newInputValue);
                }
              }}
              onChange={handleChange}
              popupIcon={<Search color="white" />}
              renderInput={(params) => (
                <TextField
                  {...params}
                  autoFocus={false}
                  variant="outlined"
                  margin="dense"
                  fullWidth
                />
              )}
            />
          </Grid>
        </Grid>
      </Toolbar>
      <TopTabs />
    </AppBar>
  );
};
export default TopBar;
