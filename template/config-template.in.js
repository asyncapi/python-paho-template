const { File } = require('@asyncapi/generator-react-sdk');

function ReadmeFile({ asyncapi }) {
    return (
        <File name={'config-template.in'}>
            {`[DEFAULT]
host=
password=
port=
username=
`}
        </File>
    );
}

module.exports = ReadmeFile;