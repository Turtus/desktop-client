import {
  Button,
  CardContent,
  Container,
  Grid,
  IconButton,
  InputAdornment,
  Stack,
  TextField,
  Typography,
} from "@mui/material";
import { useSnackbar } from "notistack";
import React, { ReactElement, useEffect, useState } from "react";
import { Filter, Save, Upload, X } from "react-feather";

import {
  DELETE,
  EXPORT,
  ExportFile,
  GET_ALL_RECORDS,
  GET_UNIQUE_TAGS,
  IMPORT,
  LISTENER_STATUS,
  SAVE_RECORD,
  TOAST_LENGTH,
  VIEW,
} from "../../shared/constants";
import { ipcRenderer } from "../../shared/electron";
import { ListenerStatus, Record as ListenerRecord, Selector } from "../../shared/pb/types";
import { byConnectionName, compareTitles } from "../../shared/sorting";
import ConnectionRow from "../components/ConnectionRow";
import ExportDialog, { IpcRendererEventListener } from "../components/ExportDialog";
import NewConnectionButton from "../components/NewConnectionButton";
import StyledCard from "../components/StyledCard";
import TagFolderRow from "../components/TagFolderRow";
import VirtualFolderRow from "../components/VirtualFolderRow";

function ManageConnections(): ReactElement {
  const [folderNames, setFolderNames] = useState([] as string[]);
  const [connections, setConnections] = useState([] as ListenerRecord[]);
  const [exportFile, setExportFile] = useState<ExportFile | null>(null);
  const [filter, setFilter] = useState("");
  const [statuses, setStatuses] = useState<Record<string, ListenerStatus>>({});
  const { enqueueSnackbar } = useSnackbar();

  const getConnectedCount = (conns: ListenerRecord[]) => {
    return conns.map((rec) => rec.id as string).filter((id) => statuses[id]?.listening).length || 0;
  };

  useEffect(() => {
    const listener: IpcRendererEventListener = (_, args) => {
      if (args.err) {
        enqueueSnackbar(args.err.message, {
          variant: "error",
          autoHideDuration: TOAST_LENGTH,
        });
      } else {
        const blob = new Blob([args.data], { type: "application/json" });
        const link = document.createElement("a");
        link.href = window.URL.createObjectURL(blob);
        link.download = args.filename.replace(/\s+/g, "_") + ".json";
        link.click();
      }
    };
    ipcRenderer.on(EXPORT, listener);
    return () => {
      ipcRenderer.removeListener(EXPORT, listener);
    };
  }, []);

  useEffect(() => {
    ipcRenderer.on(GET_UNIQUE_TAGS, (_, args) => {
      if (args.tags && !args.err) {
        setFolderNames([...args.tags].sort(compareTitles));
      }
    });
    ipcRenderer.on(GET_ALL_RECORDS, (_, args) => {
      if (args.err) {
        enqueueSnackbar(args.err.message, {
          variant: "error",
          autoHideDuration: TOAST_LENGTH,
        });
      } else {
        setConnections([...args.res.records].sort(byConnectionName));
      }
    });
    ipcRenderer.on(LISTENER_STATUS, (_, args) => {
      if (args.err) {
        enqueueSnackbar(args.err.message, {
          variant: "error",
          autoHideDuration: TOAST_LENGTH,
        });
      } else {
        Object.values(args.res.listeners as ListenerStatus[]).forEach(({ lastError }) => {
          if (lastError) {
            enqueueSnackbar(lastError, {
              variant: "error",
              autoHideDuration: TOAST_LENGTH,
            });
          }
        });
        setStatuses((prevState) => {
          return {
            ...prevState,
            ...args.res.listeners,
          };
        });
      }
    });
    ipcRenderer.on(DELETE, (_, args) => {
      if (args.err) {
        enqueueSnackbar(args.err.message, {
          variant: "error",
          autoHideDuration: TOAST_LENGTH,
        });
      }
    });
    ipcRenderer.on(IMPORT, (_, args) => {
      if (args.err) {
        enqueueSnackbar(args.err.message, {
          variant: "error",
          autoHideDuration: TOAST_LENGTH,
        });
      } else {
        enqueueSnackbar("Uploaded Successfully", {
          variant: "success",
          autoHideDuration: TOAST_LENGTH,
        });
        ipcRenderer.send(GET_ALL_RECORDS);
        ipcRenderer.send(GET_UNIQUE_TAGS);
      }
    });
    ipcRenderer.on(SAVE_RECORD, (_, args) => {
      if (args.err) {
        enqueueSnackbar(args.err.message, {
          variant: "error",
          autoHideDuration: TOAST_LENGTH,
        });
      } else {
        ipcRenderer.send(VIEW, args.res.id);
      }
    });
    ipcRenderer.send(LISTENER_STATUS, {
      all: true,
      ids: [],
      tags: [],
    } as Selector);
    ipcRenderer.send(GET_UNIQUE_TAGS);
    ipcRenderer.send(GET_ALL_RECORDS);

    return function cleanup() {
      ipcRenderer.removeAllListeners(GET_UNIQUE_TAGS);
      ipcRenderer.removeAllListeners(GET_ALL_RECORDS);
      ipcRenderer.removeAllListeners(LISTENER_STATUS);
      ipcRenderer.removeAllListeners(DELETE);
      ipcRenderer.removeAllListeners(IMPORT);
      ipcRenderer.removeAllListeners(SAVE_RECORD);
    };
  }, []);

  // An empty filter leaves the list untouched; otherwise only connections whose
  // title contains the text survive, and folders expand so matches are visible.
  const filterText = filter.trim().toLowerCase();
  const filtering = filterText.length > 0;
  const visibleConnections = filtering
    ? connections.filter((connection) =>
        (connection?.conn?.name || "").toLowerCase().includes(filterText),
      )
    : connections;

  const untagged = visibleConnections?.filter((connection) => !connection?.tags?.length);

  return (
    <>
      <ExportDialog exportFile={exportFile} onClose={() => setExportFile(null)} />
      <Container maxWidth={false} sx={{ pt: 4 }}>
        <Stack spacing={2}>
          <Grid>
            <Grid container sx={{ alignItems: "flex-start" }}>
              <Grid size={6}>
                <Typography variant="h3" color="textPrimary">
                  Manage Connections
                </Typography>
              </Grid>
              <Grid size={6} container sx={{ justifyContent: "flex-end" }}>
                <Grid>
                  <Button
                    type="button"
                    color="primary"
                    onClick={() => ipcRenderer.send(IMPORT)}
                    endIcon={<Upload />}
                  >
                    Import
                  </Button>
                </Grid>
                <Grid size={1} />
                {connections?.length > 0 && (
                  <Grid>
                    <Button
                      type="button"
                      color="primary"
                      onClick={() =>
                        setExportFile({
                          filename: "connections",
                          selector: {
                            all: true,
                            ids: [],
                            tags: [],
                          },
                        })
                      }
                      endIcon={<Save />}
                    >
                      Export
                    </Button>
                  </Grid>
                )}
                {connections?.length > 0 && <Grid size={1} />}
                <Grid>
                  <NewConnectionButton />
                </Grid>
              </Grid>
            </Grid>
          </Grid>
          <Grid>
            <TextField
              id="connection-filter"
              label="Filter"
              placeholder="Filter connections by name"
              value={filter}
              onChange={(evt) => setFilter(evt.target.value)}
              size="small"
              fullWidth
              sx={{ maxWidth: 420 }}
              slotProps={{
                input: {
                  startAdornment: (
                    <InputAdornment position="start">
                      <Filter size={16} />
                    </InputAdornment>
                  ),
                  endAdornment: filtering ? (
                    <InputAdornment position="end">
                      <IconButton
                        aria-label="clear filter"
                        size="small"
                        onClick={() => setFilter("")}
                      >
                        <X size={16} />
                      </IconButton>
                    </InputAdornment>
                  ) : null,
                },
              }}
            />
          </Grid>
          <StyledCard>
            <CardContent>
              {filtering && visibleConnections.length === 0 && (
                <Typography variant="subtitle2" sx={{ p: 2 }}>
                  No connections match “{filter.trim()}”.
                </Typography>
              )}
              {folderNames.map((folderName) => {
                const folderConns = visibleConnections.filter(
                  (connection) => connection?.tags?.indexOf(folderName) >= 0,
                );
                if (filtering && folderConns.length === 0) {
                  return null;
                }
                return (
                  <TagFolderRow
                    key={"folderRow" + folderName}
                    folderName={folderName}
                    connectedListeners={getConnectedCount(folderConns)}
                    totalListeners={folderConns.length}
                    connectionIds={folderConns.map((rec) => rec.id as string)}
                    forceOpen={filtering}
                  >
                    {folderConns.map((record) => {
                      return (
                        <ConnectionRow
                          key={"connectionRow" + folderName + record.id}
                          folderName={folderName}
                          connection={record}
                          connected={!!record?.id && statuses[record.id as string]?.listening}
                          port={statuses[record.id as string]?.listenAddr || ""}
                        />
                      );
                    })}
                  </TagFolderRow>
                );
              })}
              {(!filtering || visibleConnections.length > 0) && (
                <VirtualFolderRow
                  folderName="All Connections"
                  totalListeners={visibleConnections.length}
                  connectedListeners={getConnectedCount(visibleConnections)}
                  forceOpen={filtering}
                >
                  {visibleConnections.map((record) => {
                    return (
                      <ConnectionRow
                        key={"connectionRowAllConnections" + record.id}
                        folderName="All Connections"
                        connection={record}
                        connected={!!record?.id && statuses[record.id as string]?.listening}
                        port={statuses[record.id as string]?.listenAddr || ""}
                      />
                    );
                  })}
                </VirtualFolderRow>
              )}
              {(!filtering || untagged.length > 0) && (
                <VirtualFolderRow
                  folderName="Untagged"
                  totalListeners={untagged.length}
                  connectedListeners={getConnectedCount(untagged)}
                  forceOpen={filtering}
                >
                  {untagged.map((record) => {
                    return (
                      <ConnectionRow
                        key={"connectionRowUntagged" + record.id}
                        folderName="Untagged"
                        connection={record}
                        connected={!!record?.id && statuses[record.id as string]?.listening}
                        port={statuses[record.id as string]?.listenAddr || ""}
                      />
                    );
                  })}
                </VirtualFolderRow>
              )}
            </CardContent>
          </StyledCard>
        </Stack>
      </Container>
    </>
  );
}
export default ManageConnections;
