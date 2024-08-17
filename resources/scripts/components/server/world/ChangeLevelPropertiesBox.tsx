import React, { useEffect, useState } from 'react';
import { ServerContext } from '@/state/server';
import TitledGreyBox from '@/components/elements/TitledGreyBox';
import { Form, Formik, FormikHelpers, useFormikContext } from 'formik';
import { Actions, useStoreActions } from 'easy-peasy';
import renameServer from '@/api/server/renameServer';
import Field from '@/components/elements/Field';
import { object, string } from 'yup';
import SpinnerOverlay from '@/components/elements/SpinnerOverlay';
import { ApplicationStore } from '@/state';
import { httpErrorToHuman } from '@/api/http';
import { Button } from '@/components/elements/button/index';
import tw from 'twin.macro';
import { useHistory, useLocation } from 'react-router';
import { hashToPath } from '@/helpers';
import getFileContents from '@/api/server/files/getFileContents';
import { ServerError } from '@/components/elements/ScreenBlock';
import useFlash from '@/plugins/useFlash';
import saveFileContents from '@/api/server/files/saveFileContents';

interface Values {
    level_name: string;
    level_seed: string;
    level_type: string;
}

function mapToProperties(content: string): Record<string, string> {
    const properties: Record<string, string> = {};
    if (content) {
        for (const prop of content.split("\n")) {
            const [key, value] = prop.split("=");
            if (value == undefined) continue;

            properties[key] = value;
        }
    }

    return properties;
}

const ChangeLevelProperties = () => {
    const { isSubmitting } = useFormikContext<Values>();

    return (
        <TitledGreyBox title={'Change Level Properties'} css={tw`relative`}>
            <SpinnerOverlay visible={isSubmitting} />
            <Form css={tw`mb-0`}>
                <Field id={'level_name'} name={'level_name'} label={'Level Name'} type={'text'} />
                <div css={tw`mt-6`}>
                    <Field id={'level_seed'} name={'level_seed'} label={'Level Seed'} type={'text'} />
                </div>
                <div css={tw`mt-6`}>
                    <Field id={'level_type'} name={'level_type'} label={'Level Type'} type={'text'} />
                </div>
                <div css={tw`mt-6 text-right`}>
                    <Button type={'submit'}>Save</Button>
                </div>
            </Form>
        </TitledGreyBox>
    );
};

export default () => {
    const { addError, clearFlashes } = useFlash();

    const submit = ({ level_name, level_seed, level_type }: Values, { setSubmitting }: FormikHelpers<Values>) => {
        clearFlashes('world');

        async function save() {
            let content = await getFileContents(uuid, "server.properties");

            content = content
                .replace(/level-name=.*/, `level-name=${level_name}`)
                .replace(/level-seed=.*/, `level-seed=${level_seed}`)
                .replace(/level-type=.*/, `level-type=${level_type}`);
            
            await saveFileContents(uuid, "server.properties", content);
        }
        save()
            .catch((error) => {
                console.error(error);
                addError({ key: 'settings', message: httpErrorToHuman(error) });
            })
            .then(() => setSubmitting(false));
    };

    const [error, setError] = useState('');
    const [loading, setLoading] = useState(true);
    const [content, setContent] = useState('');

    const history = useHistory();
    const uuid = ServerContext.useStoreState((state) => state.server.data!.uuid);

    useEffect(() => {
        setError('');
        setLoading(true);
        getFileContents(uuid, "server.properties")
            .then(setContent)
            .catch((error) => {
                console.error(error);
                setError(httpErrorToHuman(error));
            })
            .then(() => setLoading(false));
    }, [uuid]);

    if (error) {
        return <ServerError message={error} onBack={() => history.goBack()} />;
    }

    const properties = mapToProperties(content);
    return (
        <>
            <SpinnerOverlay visible={loading} />
            {!loading && <Formik
                            onSubmit={submit}
                            initialValues={{
                                level_name: properties["level-name"],
                                level_seed: properties["level-seed"],
                                level_type: properties["level-type"],
                            }}
                            validationSchema={object().shape({
                                level_name: string().required(),
                                level_seed: string().nullable(),
                                level_type: string().required()
                            })}
                        >
                            <ChangeLevelProperties />
                        </Formik>
            }
        </>
    );
};
