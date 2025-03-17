
export type Database = {
  public: {
    functions: {
      enable_realtime: {
        Args: {
          table_name: string;
        };
        Returns: boolean;
      };
    };
  };
};
