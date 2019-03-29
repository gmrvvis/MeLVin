class Processor:
    def __init__(self):
        self.updatedState = {}

    def set_result(self, updatedState):
        self.updatedState = updatedState

    def set_progress(progress, message):
        print("Script running", progress, " : ", message)

    def process(self, input, state, dataHandler, source_code):
        setProgress = self.set_progress
        setResult = self.set_result
        byte_code = compile(source_code, '<inline>', 'exec')
        exec(byte_code)
