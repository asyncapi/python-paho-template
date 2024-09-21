const { File } = require('@asyncapi/generator-react-sdk');

function ReadmeFile({ asyncapi }) {
    return (
        <File name={'README.md'}>
            {`# ${ asyncapi.info().title() }

## Version ${ asyncapi.info().version() }

${ asyncapi.info().description() }`}
        </File>
    );
}

module.exports = ReadmeFile;