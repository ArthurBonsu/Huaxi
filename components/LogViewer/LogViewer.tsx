// components/LogViewer/LogViewer.tsx
import React, { useState, useEffect } from 'react';
import { 
  Box, 
  Heading, 
  Text, 
  Badge, 
  Button, 
  Flex, 
  Select,
  Accordion,
  AccordionItem,
  AccordionButton,
  AccordionPanel,
  AccordionIcon,
  Code,
  IconButton,
  useColorMode,
  Tooltip
} from '@chakra-ui/react';
import { DownloadIcon, DeleteIcon } from '@chakra-ui/icons';
import { Logger, LogLevel, LogEntry } from '@/utils/logger';

// Only include this component in development builds
const isDev = process.env.NODE_ENV === 'development';

const LogViewer: React.FC = () => {
  const [logs, setLogs] = useState<LogEntry[]>([]);
  const [filter, setFilter] = useState<string>('ALL');
  const [component, setComponent] = useState<string>('ALL');
  const [components, setComponents] = useState<string[]>([]);
  const [autoRefresh, setAutoRefresh] = useState<boolean>(true);
  const { colorMode } = useColorMode();
  
  // Get logs on mount and when auto-refresh is enabled
  useEffect(() => {
    if (!isDev) return;
    
    const fetchLogs = () => {
      const allLogs = Logger.getInstance().getLogs();
      setLogs(allLogs);
      
      // Extract unique components
      const uniqueComponents = Array.from(
        new Set(allLogs.map(log => log.component))
      );
      setComponents(['ALL', ...uniqueComponents]);
    };
    
    fetchLogs();
    
    let interval: NodeJS.Timeout | null = null;
    
    if (autoRefresh) {
      interval = setInterval(fetchLogs, 1000);
    }
    
    return () => {
      if (interval) clearInterval(interval);
    };
  }, [autoRefresh]);
  
  // Filter logs based on level and component
  const filteredLogs = logs.filter(log => {
    const levelMatch = filter === 'ALL' || log.level === filter;
    const componentMatch = component === 'ALL' || log.component === component;
    return levelMatch && componentMatch;
  });
  
  // Get color for log level
  const getLevelColor = (level: LogLevel): string => {
    switch (level) {
      case LogLevel.DEBUG:
        return 'gray';
      case LogLevel.INFO:
        return 'blue';
      case LogLevel.WARN:
        return 'orange';
      case LogLevel.ERROR:
        return 'red';
      default:
        return 'gray';
    }
  };
  
  // Export logs as JSON
  const handleExportLogs = () => {
    const json = JSON.stringify(logs, null, 2);
    const blob = new Blob([json], { type: 'application/json' });
    const url = URL.createObjectURL(blob);
    
    const a = document.createElement('a');
    a.href = url;
    a.download = `hospital-blockchain-logs-${new Date().toISOString()}.json`;
    a.click();
    
    URL.revokeObjectURL(url);
  };
  
  // Clear all logs
  const handleClearLogs = () => {
    Logger.getInstance().clearLogs();
    setLogs([]);
  };
  
  if (!isDev) return null;
  
  return (
    <Box 
      p={4} 
      maxWidth="100%" 
      maxHeight="500px" 
      overflowY="auto"
      borderWidth={1}
      borderRadius="md"
      bg={colorMode === 'light' ? 'gray.50' : 'gray.700'}
    >
      <Flex justifyContent="space-between" alignItems="center" mb={4}>
        <Heading size="md">Application Logs</Heading>
        
        <Flex gap={2}>
          <Select 
            size="sm" 
            width="auto" 
            value={filter}
            onChange={e => setFilter(e.target.value)}
          >
            <option value="ALL">All Levels</option>
            <option value={LogLevel.DEBUG}>Debug</option>
            <option value={LogLevel.INFO}>Info</option>
            <option value={LogLevel.WARN}>Warning</option>
            <option value={LogLevel.ERROR}>Error</option>
          </Select>
          
          <Select 
            size="sm" 
            width="auto" 
            value={component}
            onChange={e => setComponent(e.target.value)}
          >
            {components.map(comp => (
              <option key={comp} value={comp}>{comp}</option>
            ))}
          </Select>
          
          <Tooltip label={autoRefresh ? "Disable auto-refresh" : "Enable auto-refresh"}>
            <Button
              size="sm"
              variant={autoRefresh ? "solid" : "outline"}
              colorScheme="blue"
              onClick={() => setAutoRefresh(!autoRefresh)}
            >
              {autoRefresh ? "Auto" : "Manual"}
            </Button>
          </Tooltip>
          
          <Tooltip label="Export logs">
            <IconButton
              aria-label="Export logs"
              icon={<DownloadIcon />}
              size="sm"
              onClick={handleExportLogs}
            />
          </Tooltip>
          
          <Tooltip label="Clear logs">
            <IconButton
              aria-label="Clear logs"
              icon={<DeleteIcon />}
              size="sm"
              colorScheme="red"
              variant="outline"
              onClick={handleClearLogs}
            />
          </Tooltip>
        </Flex>
      </Flex>
      
      <Text mb={2}>
        Showing {filteredLogs.length} of {logs.length} logs
      </Text>
      
      <Accordion allowMultiple>
        {filteredLogs.map((log, index) => (
          <AccordionItem key={index}>
            <h2>
              <AccordionButton>
                <Flex flex="1" textAlign="left" alignItems="center" gap={2}>
                  <Badge colorScheme={getLevelColor(log.level)}>
                    {log.level}
                  </Badge>
                  <Text fontWeight="bold">{log.component}</Text>
                  <Text flex="1" isTruncated>{log.message}</Text>
                  <Text fontSize="xs" color="gray.500">
                    {new Date(log.timestamp).toLocaleTimeString()}
                  </Text>
                </Flex>
                <AccordionIcon />
              </AccordionButton>
            </h2>
            <AccordionPanel pb={4}>
              <Text mb={2}><strong>Timestamp:</strong> {log.timestamp}</Text>
              <Text mb={2}><strong>Message:</strong> {log.message}</Text>
              {log.data && (
                <Box>
                  <Text mb={1}><strong>Data:</strong></Text>
                  <Code 
                    display="block" 
                    whiteSpace="pre" 
                    p={2} 
                    borderRadius="md"
                    overflowX="auto"
                  >
                    {JSON.stringify(log.data, null, 2)}
                  </Code>
                </Box>
              )}
            </AccordionPanel>
          </AccordionItem>
        ))}
      </Accordion>
      
      {filteredLogs.length === 0 && (
        <Text textAlign="center" py={4} color="gray.500">
          No logs matching the current filters
        </Text>
      )}
    </Box>
  );
};

export default LogViewer;